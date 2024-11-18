"use client";
import { AuthUser } from "@supabase/supabase-js";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { v4 } from "uuid";
import { createClientComponentClient } from "@/lib/supabase";
import { createWorkspace } from "@/lib/supabase/queries";
import { Subscription, Workspace } from "@/lib/types";
import { useAppState } from "@/lib/providers/state-provider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EmojiPicker from "@/components/global/emoji-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface DashboardSetupProps {
  user: AuthUser;
  subscription: Subscription | null;
}

export default function DashboardSetup({ user, subscription }: DashboardSetupProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const supabase = createClientComponentClient();

  const [selectedEmoji, setSelectedEmoji] = useState("💼");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<{ workspaceName: string; logo: FileList }>({
    mode: "onChange",
    defaultValues: { workspaceName: "", logo: undefined },
  });

  const onSubmit: SubmitHandler<{ workspaceName: string; logo: FileList }> = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4();

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: "3600",
            upsert: true,
          });
        if (error) throw new Error();
        filePath = data.path;
      } catch {
        toast({
          variant: "destructive",
          title: "Error! Could not upload your workspace logo",
        });
      }
    }

    try {
      const newWorkspace: Workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: selectedEmoji,
        id: workspaceUUID,
        inTrash: "",
        title: value.workspaceName,
        workspaceOwner: user.id,
        logo: filePath || null,
        bannerUrl: "",
      };
      const { data, error: createError } = await createWorkspace(newWorkspace);
      if (createError) throw new Error();

      dispatch({
        type: "ADD_WORKSPACE",
        payload: { ...newWorkspace, folders: [] },
      });

      toast({ title: `${newWorkspace.title} has been created successfully.` });
      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch {
      toast({
        variant: "destructive",
        title: "Could not create your workspace",
        description: "Oops! Something went wrong. Please try again.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started. You can add collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <div className="w-full">
                <Label htmlFor="workspaceName" className="text-sm text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Workspace Name"
                  disabled={isLoading}
                  {...register("workspaceName", { required: "Workspace name is required" })}
                />
                <small className="text-red-600">{errors?.workspaceName?.message?.toString()}</small>
              </div>
            </div>
            <div>
              <Label htmlFor="logo" className="text-sm text-muted-foreground">
                Workspace Logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Logo"
                disabled={isLoading || subscription?.status !== "active"}
                {...register("logo", { required: false })}
              />
              {subscription?.status !== "active" && (
                <small className="text-muted-foreground block">
                  To customize your workspace, you need to be on a Pro Plan
                </small>
              )}
            </div>
            <div className="self-end">
              <Button disabled={isLoading} type="submit">
                {!isLoading ? "Create Workspace" : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
