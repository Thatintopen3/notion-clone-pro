import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps { className?: string }

export default function Loader({ className }: LoaderProps) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}
