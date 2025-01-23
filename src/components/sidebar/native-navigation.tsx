"use client";
import Link from "next/link";
import React from "react";
import CypressHomeIcon from "@/components/icons/cypress-home-icon";
import CypressSettingsIcon from "@/components/icons/cypress-settings-icon";
import CypressTrashIcon from "@/components/icons/cypress-trash-icon";
import Settings from "@/components/settings/settings";
import Trash from "@/components/trash/trash";
import CustomDialogTrigger from "@/components/global/custom-dialog-trigger";

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

export default function NativeNavigation({ myWorkspaceId, className }: NativeNavigationProps) {
  return (
    <nav className={className}>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>
        <CustomDialogTrigger header="Settings" content={<Settings />} description="">
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer">
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </CustomDialogTrigger>
        <CustomDialogTrigger header="Trash" content={<Trash workspaceId={myWorkspaceId} />} description="">
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer">
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </CustomDialogTrigger>
      </ul>
    </nav>
  );
}
