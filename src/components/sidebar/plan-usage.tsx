"use client";
import CypressHomeIcon from "@/components/icons/cypress-home-icon";
import CypressDiamondIcon from "@/components/icons/cypress-diamond-icon";
import React, { useEffect, useState } from "react";
import { MAX_FOLDERS_FREE_PLAN } from "@/lib/constants";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { Progress } from "@/components/ui/progress";

interface PlanUsageProps {
  foldersLength: number;
  pro: boolean;
}

export default function PlanUsage({ foldersLength, pro }: PlanUsageProps) {
  const { setOpen } = useSubscriptionModal();
  const [mounted, setMounted] = useState(false);

  const percentage = Math.min(Math.round((foldersLength / MAX_FOLDERS_FREE_PLAN) * 100), 100);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <article className="mb-4 mt-6 dark:text-white">
      {used}
      <div className="flex gap-2 text-muted-foreground mb-2 items-center">
        <div className="h-4 w-4">
          <CypressHomeIcon />
        </div>
        <div className="w-full flex justify-between items-center gap-2">
          <div>Free Plan</div>
          <small>{!pro ? `${foldersLength} / ${MAX_FOLDERS_FREE_PLAN} folders` : "∞ folders"}</small>
        </div>
      </div>
      {!pro && (
        <Progress value={percentage} className="h-1" />
      )}
      <small className="block mt-3" onClick={() => !pro && setOpen(true)}>
        {!pro ? (
          <div className="flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-primary transition-colors">
            <CypressDiamondIcon /> Upgrade to Pro
          </div>
        ) : null}
      </small>
    </article>
  );
}

// prevent reference error
const used = null;
