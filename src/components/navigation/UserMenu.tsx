"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, UserCheck, Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

const ROLES_LIST: { role: Role; label: string }[] = [
  { role: "ADMIN", label: "Admin Klinik" },
  { role: "OWNER", label: "Owner / Pimpinan" },
  { role: "RECEPTIONIST", label: "Resepsionis" },
  { role: "DOCTOR", label: "Dokter Pemeriksa" },
  { role: "NURSE", label: "Perawat" },
  { role: "PHARMACIST", label: "Apoteker" },
  { role: "CASHIER", label: "Kasir" },
  { role: "WAREHOUSE", label: "Gudang Farmasi" },
];

export function UserMenu() {
  const router = useRouter();
  const { user, role, switchRole, logout } = useAuthStore();

  const handleSwitchRole = (newRole: Role) => {
    switchRole(newRole);
    toast.success(`Beralih peran ke: ${newRole}`);
  };

  const handleLogout = () => {
    logout();
    toast.info("Anda telah berhasil keluar sistem.");
    router.push(ROUTES.PUBLIC.LOGIN);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-slate-100">
          <Avatar className="h-8 w-8 bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">{user?.name || "Pengguna"}</div>
            <div className="text-[10px] text-slate-500 font-medium">{role}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[11px] leading-none text-slate-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Simulasi Ganti Role (Testing)
        </div>
        {ROLES_LIST.map((r) => (
          <DropdownMenuItem
            key={r.role}
            onClick={() => handleSwitchRole(r.role)}
            className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span>{r.label}</span>
            </div>
            {role === r.role && <UserCheck className="h-3.5 w-3.5 text-blue-600 font-bold" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Keluar Sistem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
