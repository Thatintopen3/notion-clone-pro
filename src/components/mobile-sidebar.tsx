"use client";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export default function MobileSidebar({ children }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger className="sm:hidden fixed left-6 top-4 z-[100] w-6 h-6">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-fit h-screen">
        {children}
      </SheetContent>
    </Sheet>
  );
}
