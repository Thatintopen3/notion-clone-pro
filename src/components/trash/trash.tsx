"use client";
import React, { useEffect, useState } from "react";
import { useAppState } from "@/lib/providers/state-provider";
import { FileIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { File, Folder } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { restoreFileFromTrash, restoreFolderFromTrash } from "@/lib/supabase/queries";

interface TrashProps {
  workspaceId: string;
}

type TrashFile = File & { type: "file"; folderId: string };
type TrashFolder = Folder & { type: "folder" };
type TrashItem = TrashFile | TrashFolder;

export default function Trash({ workspaceId }: TrashProps) {
  const { state } = useAppState();
  const { toast } = useToast();
  const [trashFiles, setTrashFiles] = useState<TrashItem[]>([]);

  useEffect(() => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;

    const items: TrashItem[] = [];
    workspace.folders.forEach((folder) => {
      if (folder.inTrash) items.push({ ...folder, type: "folder" });
      folder.files.forEach((file) => {
        if (file.inTrash) items.push({ ...file, type: "file", folderId: folder.id });
      });
    });
    setTrashFiles(items);
  }, [state, workspaceId]);

  return (
    <section>
      {!trashFiles.length ? (
        <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          No items in trash
        </div>
      ) : (
        <>
          <span className="text-muted-foreground text-sm">Files and folders that have been deleted from the workspace will appear here.</span>
          <div className="flex flex-col gap-2 mt-4">
            {trashFiles.map((item) =>
              item.type === "folder" ? (
                <Link
                  href={`/dashboard/${workspaceId}/${item.id}`}
                  key={item.id}
                  className="hover:bg-muted rounded-md p-2 flex item-center justify-between"
                >
                  <article className="flex gap-4 items-center w-full justify-between">
                    <div className="flex gap-2 items-center">
                      <FolderIcon />
                      {item.title}
                    </div>
                  </article>
                </Link>
              ) : (
                <Link
                  href={`/dashboard/${workspaceId}/${item.folderId}/${item.id}`}
                  key={item.id}
                  className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
                >
                  <article className="flex gap-4 items-center w-full justify-between">
                    <div className="flex gap-2 items-center">
                      <FileIcon />
                      {item.title}
                    </div>
                  </article>
                </Link>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}
