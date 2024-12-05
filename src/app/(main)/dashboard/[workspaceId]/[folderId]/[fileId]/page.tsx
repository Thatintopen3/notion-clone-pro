"use client";
import QuillEditor from "@/components/quill-editor/quill-editor";

export default function FilePage({
  params,
}: {
  params: { workspaceId: string; folderId: string; fileId: string };
}) {
  return (
    <div className="relative">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={params}
      />
    </div>
  );
}
