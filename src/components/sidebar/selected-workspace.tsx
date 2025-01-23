"use client";
import { createClientComponentClient } from "@/lib/supabase";
import { Workspace } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface SelectedWorkspaceProps {
  workspace: Workspace;
  onClick?: (option: Workspace) => void;
}

export default function SelectedWorkspace({ workspace, onClick }: SelectedWorkspaceProps) {
  const supabase = createClientComponentClient();
  const [workspaceLogo, setWorkspaceLogo] = useState("/cypresslogo.svg");

  useEffect(() => {
    if (workspace.logo) {
      const path = supabase.storage.from("workspace-logos").getPublicUrl(workspace.logo)?.data.publicUrl;
      setWorkspaceLogo(path);
    }
  }, [workspace]);

  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => onClick && onClick(workspace)}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center cursor-pointer items-center my-2"
    >
      <Image src={workspaceLogo} alt="workspace logo" width={26} height={26} objectFit="cover" />
      <div className="flex flex-col">
        <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">{workspace.title}</p>
      </div>
    </Link>
  );
}
