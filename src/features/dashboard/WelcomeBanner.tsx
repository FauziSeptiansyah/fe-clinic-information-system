import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/types";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  OWNER: "Owner",
  RECEPTIONIST: "Resepsionis",
  DOCTOR: "Dokter",
  NURSE: "Perawat",
  PHARMACIST: "Apoteker",
  CASHIER: "Kasir",
  WAREHOUSE: "Gudang Farmasi",
};

export function roleLabel(role: Role) {
  return ROLE_LABEL[role];
}

export function WelcomeBanner({
  userName,
  role,
  subtitle,
  actions,
}: {
  userName: string;
  role: Role;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white shadow-sm">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]"
      />
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
      />
      <div className="relative space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat Datang, {userName}
          </h1>
          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-semibold">
            {ROLE_LABEL[role]}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-blue-100">
          {subtitle} • Hari ini: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {actions && <div className="relative flex flex-wrap gap-2 pt-2 sm:pt-0">{actions}</div>}
    </div>
  );
}
