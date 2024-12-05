"use client";
import QuillEditor from "@/components/quill-editor/quill-editor";

export default function FolderPage({
  params,
}: {
  params: { workspaceId: string; folderId: string };
}) {
  return (
    <div className="relative">
      <QuillEditor
        dirType="folder"
        fileId={params.folderId}
        dirDetails={{ workspaceId: params.workspaceId, folderId: params.folderId }}
      />
    </div>
  );
}
