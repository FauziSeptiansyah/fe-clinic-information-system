"use client";

import * as React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { UserMenu } from "./UserMenu";
import { CommandSearch } from "./CommandSearch";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden text-slate-600">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CommandSearch />
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-800 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600"></span>
        </Button>
        <div className="h-6 w-px bg-slate-200"></div>
        <UserMenu />
      </div>
    </header>
  );
}
