import * as React from "react";
import { Permission } from "@/types";
import { useAuthStore } from "@/stores/authStore";

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const can = useAuthStore((state) => state.can);
  const isAllowed = can(permission);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
