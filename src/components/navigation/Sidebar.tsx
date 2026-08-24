"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_CONFIG } from "@/config/navigationConfig";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/config/permissionConfig";
import { cn } from "@/lib/utils";
import { Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);

  return (
    <aside className={cn("flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 w-64 select-none", className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 shrink-0 bg-gradient-to-r from-slate-900 to-slate-900/80">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold shadow-md shadow-blue-500/30">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight leading-tight block">Klinik Sehat</span>
            <span className="text-[10px] text-blue-400 font-medium leading-none block">Pratama Medika</span>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {NAVIGATION_CONFIG.map((group) => {
          // Filter items based on user permissions
          const visibleItems = group.items.filter((item) => {
            if (!item.permissions || item.permissions.length === 0) return true;
            return item.permissions.some((perm) => hasPermission(role || undefined, perm));
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {group.group}
              </div>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors group",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xs shadow-blue-900/40 font-semibold"
                          : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-blue-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>v2.4.0 • Enterprise</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </span>
      </div>
    </aside>
  );
}
