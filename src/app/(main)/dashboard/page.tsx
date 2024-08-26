import { createServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getCollaboratingWorkspaces,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import DashboardSetup from "@/components/dashboard-setup";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: subscriptionData, error: subscriptionError } = await getUserSubscriptionStatus(user.id);
  const { data: workspacesData, error: workspacesError } = await getPrivateWorkspaces(user.id);

  if (subscriptionError || workspacesError) redirect("/dashboard");

  if (!workspacesData.length) {
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup user={user} subscription={subscriptionData} />
      </div>
    );
  }

  redirect(`/dashboard/${workspacesData[0].id}`);
}
