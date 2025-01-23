"use client";
import { Subscription } from "@/lib/types";
import React from "react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CypressDiamondIcon from "@/components/icons/cypress-diamond-icon";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";

interface UserCardProps {
  subscription: Subscription | null;
}

export default function UserCard({ subscription }: UserCardProps) {
  const { user } = useSupabaseUser();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <article className="hidden sm:flex justify-between items-center px-4 py-2 dark:bg-Neutrals/neutrals-12 rounded-3xl">
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src="" />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm">
            {subscription?.status === "active" ? (
              <small className="text-brand-washedPurple ml-2 flex items-center gap-1"><CypressDiamondIcon /> Pro</small>
            ) : (
              "Free"
            )}
          </span>
          <small className="w-[100px] overflow-hidden overflow-ellipsis">{user?.email}</small>
        </div>
      </aside>
      <div className="flex items-center justify-center cursor-pointer hover:dark:text-white" onClick={logout}>
        <LogOut />
      </div>
    </article>
  );
}
