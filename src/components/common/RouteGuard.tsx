"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/config/permissionConfig";
import { getRequiredPermission } from "@/config/routeAccess";

/**
 * Real route-level RBAC, not just a hidden sidebar item: if the current staff role
 * lacks the permission a route requires, the page content is replaced with an
 * access-denied notice instead of rendering. Navigating here directly by URL is
 * blocked the same as clicking a menu item that was never shown.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const requiredPermission = getRequiredPermission(pathname);

  if (requiredPermission && !hasPermission(role || undefined, requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Akses Ditolak</h1>
        <p className="max-w-md text-sm text-slate-500 mt-2">
          Anda tidak memiliki hak izin yang cukup untuk mengakses halaman ini sebagai{" "}
          <span className="font-semibold text-slate-700">{role || "pengguna"}</span>. Hubungi Administrator jika ini keliru.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
