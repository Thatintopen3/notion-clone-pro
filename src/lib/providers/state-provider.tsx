"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  Dispatch,
} from "react";
import { File, Folder, Workspace, appWorkspacesType, appFoldersType } from "@/lib/types";
import { usePathname } from "next/navigation";
import { getFiles, getFolders } from "@/lib/supabase/queries";

export type appFilesType = File & {};

interface AppState {
  workspaces: appWorkspacesType[];
}

type Action =
  | { type: "ADD_WORKSPACE"; payload: appWorkspacesType }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | { type: "UPDATE_WORKSPACE"; payload: { workspace: Partial<appWorkspacesType>; workspaceId: string } }
  | { type: "SET_WORKSPACES"; payload: { workspaces: appWorkspacesType[] } }
  | { type: "SET_FOLDERS"; payload: { workspaceId: string; folders: appFoldersType[] | [] } }
  | { type: "ADD_FOLDER"; payload: { workspaceId: string; folder: appFoldersType } }
  | { type: "ADD_FILE"; payload: { workspaceId: string; file: File; folderId: string } }
  | { type: "DELETE_FILE"; payload: { workspaceId: string; folderId: string; fileId: string } }
  | { type: "DELETE_FOLDER"; payload: { workspaceId: string; folderId: string } }
  | { type: "SET_FILES"; payload: { workspaceId: string; files: File[]; folderId: string } }
  | { type: "UPDATE_FOLDER"; payload: { folder: Partial<appFoldersType>; workspaceId: string; folderId: string } }
  | { type: "UPDATE_FILE"; payload: { file: Partial<appFilesType>; folderId: string; workspaceId: string; fileId: string } };

const initialState: AppState = { workspaces: [] };

function appReducer(state: AppState = initialState, action: Action): AppState {
  switch (action.type) {
    case "ADD_WORKSPACE":
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case "DELETE_WORKSPACE":
      return { ...state, workspaces: state.workspaces.filter((w) => w.id !== action.payload) };
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId ? { ...w, ...action.payload.workspace } : w
        ),
      };
    case "SET_WORKSPACES":
      return { ...state, workspaces: action.payload.workspaces };
    case "SET_FOLDERS":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? { ...w, folders: action.payload.folders.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()) }
            : w
        ),
      };
    case "ADD_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? { ...w, folders: [...w.folders, action.payload.folder] }
            : w
        ),
      };
    case "UPDATE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === action.payload.folderId ? { ...f, ...action.payload.folder } : f
                ),
              }
            : w
        ),
      };
    case "DELETE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? { ...w, folders: w.folders.filter((f) => f.id !== action.payload.folderId) }
            : w
        ),
      };
    case "SET_FILES":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === action.payload.folderId ? { ...f, files: action.payload.files } : f
                ),
              }
            : w
        ),
      };
    case "ADD_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === action.payload.folderId
                    ? { ...f, files: [...f.files, action.payload.file] }
                    : f
                ),
              }
            : w
        ),
      };
    case "DELETE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === action.payload.folderId
                    ? { ...f, files: f.files.filter((fi) => fi.id !== action.payload.fileId) }
                    : f
                ),
              }
            : w
        ),
      };
    case "UPDATE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.workspaceId
            ? {
                ...w,
                folders: w.folders.map((f) =>
                  f.id === action.payload.folderId
                    ? {
                        ...f,
                        files: f.files.map((fi) =>
                          fi.id === action.payload.fileId ? { ...fi, ...action.payload.file } : fi
                        ),
                      }
                    : f
                ),
              }
            : w
        ),
      };
    default:
      return initialState;
  }
}

interface AppStateContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
  workspaceId: string | undefined;
  folderId: string | undefined;
  fileId: string | undefined;
}

const AppStateContext = createContext<AppStateContextType>({
  state: initialState,
  dispatch: () => {},
  workspaceId: undefined,
  folderId: undefined,
  fileId: undefined,
});

interface AppStateProviderProps {
  children: React.ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pathname = usePathname();

  const workspaceId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);
    if (urlSegments) {
      if (urlSegments.length > 1) return urlSegments[1];
    }
  }, [pathname]);

  const folderId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);
    if (urlSegments) {
      if (urlSegments?.length > 2) return urlSegments[2];
    }
  }, [pathname]);

  const fileId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);
    if (urlSegments) {
      if (urlSegments?.length > 3) return urlSegments[3];
    }
  }, [pathname]);

  useEffect(() => {
    if (!folderId || !workspaceId) return;
    const fetchFiles = async () => {
      const { error: filesError, data } = await getFiles(folderId);
      if (filesError) { console.log(filesError); return; }
      if (!data) return;
      dispatch({
        type: "SET_FILES",
        payload: { workspaceId, files: data, folderId },
      });
    };
    fetchFiles();
  }, [folderId, workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchFolders = async () => {
      const { error: foldersError, data } = await getFolders(workspaceId);
      if (foldersError) { console.log(foldersError); return; }
      if (!data) return;
      dispatch({
        type: "SET_FOLDERS",
        payload: { workspaceId, folders: data },
      });
    };
    fetchFolders();
  }, [workspaceId]);

  return (
    <AppStateContext.Provider value={{ state, dispatch, workspaceId, folderId, fileId }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
}
