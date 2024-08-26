import { createServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWorkspaceDetails } from "@/lib/supabase/queries";
import QuillEditor from "@/components/quill-editor/quill-editor";

export default async function WorkspacePage({ params }: { params: { workspaceId: string } }) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await getWorkspaceDetails(params.workspaceId);
  if (error || !data?.length) redirect("/dashboard");

  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
}
