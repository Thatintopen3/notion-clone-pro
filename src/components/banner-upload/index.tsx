"use client";
import React from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { useAppState } from "@/lib/providers/state-provider";
import { updateFile, updateFolder, updateWorkspace } from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: "workspace" | "folder" | "file";
  id: string;
}

export default function BannerUpload({ children, className, dirType, id }: BannerUploadProps) {
  const supabase = createClientComponentClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const { data, error } = await supabase.storage
      .from("file-banners")
      .upload(`banner-${id}`, file, { cacheControl: "5", upsert: true });

    if (error) {
      toast({ variant: "destructive", title: "Error uploading banner" });
      return;
    }

    if (dirType === "file") {
      if (!workspaceId || !folderId) return;
      dispatch({ type: "UPDATE_FILE", payload: { file: { bannerUrl: data.path }, fileId: id, folderId, workspaceId } });
      await updateFile({ bannerUrl: data.path }, id);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({ type: "UPDATE_FOLDER", payload: { folder: { bannerUrl: data.path }, folderId: id, workspaceId } });
      await updateFolder({ bannerUrl: data.path }, id);
    }
    if (dirType === "workspace") {
      dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { bannerUrl: data.path }, workspaceId: id } });
      await updateWorkspace({ bannerUrl: data.path }, id);
    }
  };

  return (
    <button className={className} onClick={() => inputRef.current?.click()}>
      {children}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
    </button>
  );
}
