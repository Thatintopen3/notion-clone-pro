"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Logo from "../../../public/cypresslogo.svg";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <header className="p-4 flex justify-between items-center">
      <Link href="/" className="w-full flex gap-2 items-center justify-left">
        <Image src={Logo} alt="Cypress Logo" width={25} height={25} />
        <span className="font-semibold dark:text-white">cypress.</span>
      </Link>
      <aside className="flex gap-2 items-center justify-end">
        <Button variant="outline" className="p-1 hidden sm:block" onClick={() => router.push("/login")}>
          Login
        </Button>
        <Button variant="default" className="whitespace-nowrap" onClick={() => router.push("/signup")}>
          Sign Up
        </Button>
      </aside>
    </header>
  );
}
