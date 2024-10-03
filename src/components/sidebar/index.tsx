import { createServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import {
  getCollaboratingWorkspaces,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import WorkspaceDropdown from "./workspace-dropdown";
import PlanUsage from "./plan-usage";
import NativeNavigation from "./native-navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import FoldersDropdownList from "./folders-dropdown-list";
import UserCard from "./user-card";

interface SidebarProps {
  params: { workspaceId: string };
  className?: string;
}

export default async function Sidebar({ params, className }: SidebarProps) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: subscriptionData, error: subscriptionError } = await getUserSubscriptionStatus(user.id);
  const { data: workspaceFolderData, error: foldersError } = await getFolders(params.workspaceId);
  if (subscriptionError || foldersError) redirect("/dashboard");

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] = await Promise.all([
    getPrivateWorkspaces(user.id),
    getCollaboratingWorkspaces(user.id),
    getSharedWorkspaces(user.id),
  ]);

  return (
    <aside className={cn("hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between", className)}>
      <div>
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces.data}
          sharedWorkspaces={sharedWorkspaces.data}
          collaboratingWorkspaces={collaboratingWorkspaces.data}
          defaultValue={[
            ...privateWorkspaces.data,
            ...collaboratingWorkspaces.data,
            ...sharedWorkspaces.data,
          ].find((workspace) => workspace.id === params.workspaceId)}
        />
        <PlanUsage
          foldersLength={workspaceFolderData?.length || 0}
          pro={subscriptionData?.status === "active"}
        />
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea className="overflow-scroll relative h-[450px]">
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />
          <FoldersDropdownList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={params.workspaceId}
          />
        </ScrollArea>
      </div>
      <UserCard subscription={subscriptionData} />
    </aside>
  );
}
