"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@/lib/supabase";
import { createServerComponentClient } from "@/lib/supabase/server";
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  getUsersFromSearch,
  removeCollaborators,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Workspace } from "@/lib/types";
import CypressDiamondIcon from "@/components/icons/cypress-diamond-icon";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import CollaboratorSearch from "@/components/global/collaborator-search";
import { Trash } from "lucide-react";

export default function Settings() {
  const { user, subscription } = useSupabaseUser();
  const { state, dispatch, workspaceId } = useAppState();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const { setOpen } = useSubscriptionModal();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace>();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };

  const onChangeWorkspaceLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = crypto.randomUUID();
    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, { cacheControl: "3600", upsert: true });
    if (!error) {
      dispatch({ type: "UPDATE_WORKSPACE", payload: { workspace: { logo: data.path }, workspaceId } });
      await updateWorkspace({ logo: data.path }, workspaceId);
    }
    setUploadingLogo(false);
  };

  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    if (subscription?.status !== "active" && collaborators.length >= 2) {
      setOpen(true);
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };

  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], workspaceId);
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
  };

  const onDeleteWorkspace = async () => {
    if (!workspaceId) return;
    await deleteWorkspace(workspaceId);
    toast({ title: "Successfully deleted your workspace" });
    dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
    router.replace("/dashboard");
  };

  useEffect(() => {
    const showingWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId);
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions("shared");
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <span>Workspace Name</span>
      </p>
      <Input
        value={workspaceDetails ? workspaceDetails.title : ""}
        placeholder="Workspace Name"
        onChange={workspaceNameChange}
      />
      <p className="text-sm text-muted-foreground">
        Choose a logo for your workspace.
      </p>
      <Input
        type="file"
        accept="image/*"
        placeholder="Workspace Logo"
        onChange={onChangeWorkspaceLogo}
        disabled={uploadingLogo || subscription?.status !== "active"}
      />
      {subscription?.status !== "active" && (
        <small className="text-muted-foreground">
          To customize your workspace, you need to be on a{" "}
          <span onClick={() => setOpen(true)} className="text-brand-washedPurple cursor-pointer">
            Pro Plan
          </span>
        </small>
      )}
      <>
        <p className="flex items-center gap-2">Permissions</p>
        <div className="flex gap-4">
          <Button
            variant={permissions === "private" ? "default" : "outline"}
            onClick={() => setPermissions("private")}
            className="text-sm"
          >
            Private
          </Button>
          <Button
            variant={permissions === "shared" ? "default" : "outline"}
            onClick={() => setPermissions("shared")}
            className="text-sm"
          >
            Shared
          </Button>
        </div>
        {permissions === "shared" && (
          <div>
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={(user) => addCollaborator(user)}
            >
              <Button type="button" className="text-sm mt-4">
                Add Collaborators
              </Button>
            </CollaboratorSearch>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground text-bold">
                Collaborators {collaborators.length || ""}
              </span>
              <ScrollArea className="h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
                {collaborators.length ? (
                  collaborators.map((c) => (
                    <div key={c.id} className="p-4 flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <Avatar>
                          <AvatarImage src={c.avatarUrl || ""} />
                          <AvatarFallback>{c.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                          {c.email}
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => removeCollaborator(c)}>
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                    <span className="text-muted-foreground text-sm">You have no collaborators</span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
        <Alert variant="destructive">
          <AlertDescription>
            Warning! Deleting your workspace will permanently delete all data related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            className="mt-4 text-sm bg-destructive/40 border-2 border-destructive"
            onClick={onDeleteWorkspace}
          >
            Delete Workspace
          </Button>
        </Alert>
      </>
    </div>
  );
}
