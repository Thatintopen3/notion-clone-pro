"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/providers/state-provider";
import { createFile, updateFile, updateFolder } from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { v4 } from "uuid";
import TooltipComponent from "@/components/global/tooltip-component";
import { PlusIcon, Trash } from "lucide-react";
import { File } from "@/lib/types";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/global/emoji-picker";
import clsx from "clsx";

interface DropdownProps {
  title: string;
  id: string;
  listType: "folder" | "file";
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function Dropdown({ title, id, listType, iconId, children, disabled }: DropdownProps) {
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Determine folder or file path
  const isFolder = listType === "folder";
  const navigatePage = (accordionId: string, type: string) => {
    if (type === "folder") router.push(`/dashboard/${workspaceId}/${accordionId}`);
    else router.push(`/dashboard/${workspaceId}/${folderId}/${accordionId}`);
  };

  // Get list of files from state
  const listFiles = useMemo(() => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (listType === "folder") {
      return workspace?.folders.find((f) => f.id === id)?.files.filter((f) => !f.inTrash) || [];
    }
    return [];
  }, [state, workspaceId, id, listType]);

  const folderTitle: string | undefined = useMemo(() => {
    if (listType === "folder") {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === "file") {
      const fileAndFolderId = id.split("folder");
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (listType === "folder" && folderTitle) {
      await updateFolder({ title }, id);
    }
    if (listType === "file" && fileTitle) {
      const fileId = id.split("folder")[1];
      await updateFile({ title }, fileId);
    }
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { workspaceId, folderId: id, folder: { iconId: selectedEmoji } },
      });
      await updateFolder({ iconId: selectedEmoji }, id);
    }
  };

  const folderTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const fid = id.split("folder");
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { title: e.target.value }, workspaceId, folderId: id },
      });
    }
  };

  const fileTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !folderId) return;
    const fileId = id.split("folder")[1];
    dispatch({
      type: "UPDATE_FILE",
      payload: { file: { title: e.target.value }, workspaceId, folderId, fileId },
    });
  };

  const moveToTrash = async () => {
    if (!workspaceId) return;
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { inTrash: `Deleted by` }, folderId: id, workspaceId },
      });
      await updateFolder({ inTrash: `Deleted by` }, id);
    }
    if (listType === "file") {
      if (!folderId) return;
      const fileId = id.split("folder")[1];
      dispatch({
        type: "UPDATE_FILE",
        payload: { file: { inTrash: `Deleted by` }, folderId, workspaceId, fileId },
      });
      await updateFile({ inTrash: `Deleted by` }, fileId);
    }
  };

  const addNewFile = async () => {
    if (!workspaceId) return;
    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: "Untitled",
      iconId: "📄",
      id: v4(),
      workspaceId,
      bannerUrl: "",
    };
    dispatch({ type: "ADD_FILE", payload: { file: newFile, folderId: id, workspaceId } });
    const { error } = await createFile(newFile);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not create a file" });
    } else {
      toast({ title: "Success", description: "File created." });
    }
  };

  const isActive =
    (listType === "folder" && state.workspaces.find((w) => w.id === workspaceId)?.folders.find((f) => f.id === id)) ||
    listType === "file";

  return (
    <div>
      <div
        className={cn(
          "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative cursor-pointer group/folder",
          { "border-none text-md": isFolder, "border-none ml-6 text-[16px] py-1": !isFolder }
        )}
        onClick={() => navigatePage(id, listType)}
      >
        <div className="flex gap-4 items-center justify-center overflow-hidden">
          <div className="relative">
            <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
          </div>
          <input
            type="text"
            value={listType === "folder" ? folderTitle : fileTitle}
            className={cn(
              "outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7 bg-transparent",
              { "bg-muted cursor-text": isEditing, "cursor-pointer": !isEditing }
            )}
            readOnly={!isEditing}
            onDoubleClick={handleDoubleClick}
            onBlur={handleBlur}
            onChange={listType === "folder" ? folderTitleChange : fileTitleChange}
          />
        </div>
        <div className={cn("h-full hidden rounded-sm absolute right-0 items-center gap-2 bg-washed-purple-100 dark:bg-black group-hover/folder:flex", { "group-hover/file:flex": listType === "file" })}>
          <TooltipComponent message="Delete Folder">
            <Trash onClick={moveToTrash} size={15} className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors" />
          </TooltipComponent>
          {listType === "folder" && !isEditing && (
            <TooltipComponent message="Add File">
              <PlusIcon onClick={addNewFile} size={15} className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors" />
            </TooltipComponent>
          )}
        </div>
      </div>
      {/* Render files */}
      {listType === "folder" && (
        <div>
          {listFiles.map((file) => {
            const customFileId = `${id}folder${file.id}`;
            return (
              <Dropdown key={file.id} title={file.title} listType="file" id={customFileId} iconId={file.iconId} />
            );
          })}
        </div>
      )}
    </div>
  );
}
