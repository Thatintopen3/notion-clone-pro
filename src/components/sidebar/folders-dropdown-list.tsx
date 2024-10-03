"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Folder } from "@/lib/types";
import React, { useEffect, useState } from "react";
import TooltipComponent from "@/components/global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/constants";
import { createFolder } from "@/lib/supabase/queries";
import { v4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import Dropdown from "./dropdown";
import useSupabaseRealtime from "@/hooks/useSupabaseRealtime";
import { useRouter } from "next/navigation";

interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

export default function FoldersDropdownList({ workspaceFolders, workspaceId }: FoldersDropdownListProps) {
  useSupabaseRealtime();
  const { state, dispatch, folderId } = useAppState();
  const { toast } = useToast();
  const { user } = useSupabaseUser();
  const { setOpen } = useSubscriptionModal();
  const router = useRouter();
  const [folders, setFolders] = useState(workspaceFolders);
  const subscription = useSupabaseUser().subscription;

  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: "SET_FOLDERS",
        payload: { workspaceId, folders: workspaceFolders.map((f) => ({ ...f, files: [] })) },
      });
    }
  }, [workspaceFolders, workspaceId]);

  useEffect(() => {
    setFolders(
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => !folder.inTrash) || []
    );
  }, [state, workspaceId]);

  const handleCreateFolder = async () => {
    if (folders.length >= MAX_FOLDERS_FREE_PLAN && subscription?.status !== "active") {
      setOpen(true);
      return;
    }
    const newFolder: Folder = {
      data: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: "Untitled",
      iconId: "📄",
      inTrash: null,
      workspaceId,
      bannerUrl: "",
    };
    dispatch({ type: "ADD_FOLDER", payload: { workspaceId, folder: { ...newFolder, files: [] } } });
    const { error } = await createFolder(newFolder);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not create the folder" });
    } else {
      toast({ title: "Success", description: "Created folder." });
    }
  };

  return (
    <>
      <div className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8">
        <span className="text-Neutrals/neutrals-8 font-bold text-xs">FOLDERS</span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={handleCreateFolder}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <div>
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
              iconId={folder.iconId}
            />
          ))}
      </div>
    </>
  );
}
