"use client";
import { AuthUser } from "@supabase/supabase-js";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createWorkspace } from "@/lib/supabase/queries";
import { v4 } from "uuid";
import { useAppState } from "@/lib/providers/state-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Loader from "@/components/global/loader";

export default function WorkspaceCreator() {
  const { user } = useSupabaseUser();
  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const supabase = createClientComponentClient();
  const [permissions, setPermissions] = useState("private");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createItem = async () => {
    setIsLoading(true);
    const uuid = v4();
    if (user?.id) {
      const newWorkspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: "💼",
        id: uuid,
        inTrash: "",
        title,
        workspaceOwner: user.id,
        logo: null,
        bannerUrl: "",
      };
      const { error } = await createWorkspace(newWorkspace);
      if (!error) {
        dispatch({ type: "ADD_WORKSPACE", payload: { ...newWorkspace, folders: [] } });
        toast({ title: "Workspace Created", description: `${newWorkspace.title} has been created successfully.` });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Could not create your workspace", description: "Oops! Something went wrong. Please try again." });
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex gap-4 flex-col">
      <div>
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Workspace Name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <Button disabled={!title || isLoading} variant="secondary" onClick={createItem}>
        {!isLoading ? "Create Workspace" : <Loader />}
      </Button>
    </div>
  );
}
