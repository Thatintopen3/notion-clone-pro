"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, Workspace } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { createClientComponentClient } from "@/lib/supabase";
import EmojiPicker from "@/components/global/emoji-picker";
import BannerUpload from "@/components/banner-upload";
import {
  deleteFile,
  deleteFolder,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { useSocket } from "@/lib/providers/socket-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  XCircleIcon,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: "workspace" | "folder" | "file";
}

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

export default function QuillEditor({ dirDetails, fileId, dirType }: QuillEditorProps) {
  const supabase = createClientComponentClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useSupabaseUser();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<{ id: string; email: string; avatarUrl: string }[]>([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);

  const details = useMemo(() => {
    let selectedDir;
    if (dirType === "file") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === "folder") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileId);
    }
    if (dirType === "workspace") {
      selectedDir = state.workspaces.find((workspace) => workspace.id === fileId);
    }
    if (selectedDir) return selectedDir;
    return { title: dirDetails.title, iconId: dirDetails.iconId, createdAt: dirDetails.createdAt, data: dirDetails.data, inTrash: (dirDetails as any).inTrash, bannerUrl: (dirDetails as any).bannerUrl };
  }, [state, workspaceId, folderId, fileId, dirType, dirDetails]);

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname
      .split("/")
      .filter((val) => val !== "dashboard" && val);
    const workspaceDetails = state.workspaces.find((workspace) => workspace.id === workspaceId);
    const workspaceBreadCrumb = workspaceDetails ? `${workspaceDetails.iconId} ${workspaceDetails.title}` : "";
    if (segments.length === 1) return workspaceBreadCrumb;
    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find((folder) => folder.id === folderSegment);
    const folderBreadCrumb = folderDetails ? `/ ${folderDetails.iconId} ${folderDetails.title}` : "";
    if (segments.length === 2) return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find((file) => file.id === fileSegment);
    const fileBreadCrumb = fileDetails ? `/ ${fileDetails.iconId} ${fileDetails.title}` : "";
    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state, pathname, workspaceId]);

  // Quill init wrapper ref
  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const Quill = (await import("quill")).default;
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: { transformOnTextChange: true },
        },
      });
      setQuill(q);
    }
  }, []);

  // Load saved content
  useEffect(() => {
    if (!fileId) return;
    let selectedDir: any;
    const fetchInformation = async () => {
      if (dirType === "file") {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) return router.replace("/dashboard");
        if (!selectedDir[0]) return router.replace(`/dashboard/${workspaceId}`);
        if (!workspaceId || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({
          type: "UPDATE_FILE",
          payload: { file: { data: selectedDir[0].data }, fileId, folderId: selectedDir[0].folderId, workspaceId },
        });
      }
      if (dirType === "folder") {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) return router.replace("/dashboard");
        if (!selectedDir[0]) return router.replace(`/dashboard/${workspaceId}`);
        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({
          type: "UPDATE_FOLDER",
          payload: { folder: { data: selectedDir[0].data }, folderId: fileId, workspaceId: selectedDir[0].workspaceId },
        });
      }
      if (dirType === "workspace") {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) return router.replace("/dashboard");
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { data: selectedDir[0].data }, workspaceId: fileId } });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType]);

  // Autosave
  useEffect(() => {
    if (quill === null || !fileId || !details) return;
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType === "workspace") {
            dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { data: JSON.stringify(contents) }, workspaceId: fileId } });
            await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType === "folder") {
            if (!workspaceId) return;
            dispatch({ type: "UPDATE_FOLDER", payload: { folder: { data: JSON.stringify(contents) }, workspaceId, folderId: fileId } });
            await updateFolder({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType === "file") {
            if (!workspaceId || !folderId) return;
            dispatch({ type: "UPDATE_FILE", payload: { file: { data: JSON.stringify(contents) }, workspaceId, folderId, fileId } });
            await updateFile({ data: JSON.stringify(contents) }, fileId);
          }
        }
        setSaving(false);
      }, 850);
    };
    quill.on("text-change", quillHandler);
    return () => { quill.off("text-change", quillHandler); if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [quill, fileId, details, dirType, workspaceId, folderId]);

  const restoreFileHandler = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({ type: "UPDATE_FILE", payload: { file: { inTrash: "" }, fileId, folderId, workspaceId } });
      await updateFile({ inTrash: "" }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({ type: "UPDATE_FOLDER", payload: { folder: { inTrash: "" }, folderId: fileId, workspaceId } });
      await updateFolder({ inTrash: "" }, fileId);
    }
  };

  const deleteFileHandler = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({ type: "DELETE_FILE", payload: { fileId, folderId, workspaceId } });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({ type: "DELETE_FOLDER", payload: { folderId: fileId, workspaceId } });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  const iconOnChange = async (icon: string) => {
    if (!fileId) return;
    if (dirType === "workspace") {
      dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { iconId: icon }, workspaceId: fileId } });
      await updateWorkspace({ iconId: icon }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({ type: "UPDATE_FOLDER", payload: { folder: { iconId: icon }, folderId: fileId, workspaceId } });
      await updateFolder({ iconId: icon }, fileId);
    }
    if (dirType === "file") {
      if (!workspaceId || !folderId) return;
      dispatch({ type: "UPDATE_FILE", payload: { file: { iconId: icon }, fileId, folderId, workspaceId } });
      await updateFile({ iconId: icon }, fileId);
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({ type: "UPDATE_FILE", payload: { file: { bannerUrl: "" }, fileId, folderId, workspaceId } });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateFile({ bannerUrl: "" }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({ type: "UPDATE_FOLDER", payload: { folder: { bannerUrl: "" }, folderId: fileId, workspaceId } });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateFolder({ bannerUrl: "" }, fileId);
    }
    if (dirType === "workspace") {
      dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { bannerUrl: "" }, workspaceId: fileId } });
      await supabase.storage.from("file-banners").remove([`banner-${fileId}`]);
      await updateWorkspace({ bannerUrl: "" }, fileId);
    }
    setDeletingBanner(false);
  };

  return (
    <>
      <div className="relative">
        {details.inTrash && (
          <article className="py-2 z-40 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">This {dirType} is in the trash.</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          <div>{breadCrumbs}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators?.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                        <AvatarImage src={collaborator.avatarUrl || ""} className="rounded-full" />
                        <AvatarFallback>{collaborator.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {saving ? (
              <Badge variant="secondary" className="bg-orange-600 top-4 text-white right-4 z-50">
                Saving...
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-600 top-4 text-white right-4 z-50">
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
      {(details as any).bannerUrl && (
        <div className="relative w-full h-[200px]">
          <Image
            src={supabase.storage.from("file-banners").getPublicUrl((details as any).bannerUrl).data.publicUrl}
            fill
            className="w-full md:h-48 h-20 object-cover"
            alt="Banner Image"
          />
        </div>
      )}
      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div className="w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          <div className="text-[80px]">
            <EmojiPicker getValue={iconOnChange}>
              <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                {details?.iconId}
              </div>
            </EmojiPicker>
          </div>
          <div className="flex">
            <BannerUpload
              id={fileId}
              dirType={dirType}
              className="mt-2 text-sm text-muted-foreground p-2 hover:text-card-foreground transition-all rounded-md"
            >
              {(details as any).bannerUrl ? "Update Banner" : "Add Banner"}
            </BannerUpload>
            {(details as any).bannerUrl && (
              <Button
                disabled={deletingBanner}
                onClick={deleteBanner}
                variant="ghost"
                className="gap-2 hover:bg-background flex item-center justify-center mt-2 text-sm text-muted-foreground w-36 p-2 rounded-md"
              >
                <XCircleIcon size={16} />
                <span className="whitespace-nowrap font-normal">Remove Banner</span>
              </Button>
            )}
          </div>
          <span className="text-muted-foreground text-3xl font-bold h-9">
            {details?.title}
          </span>
          <span className="text-muted-foreground text-sm">{dirType.toUpperCase()}</span>
        </div>
        <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
      </div>
    </>
  );
}
