const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log("Created: " + filePath);
}

// 1. Breadcrumbs.tsx
writeFile("src/components/navigation/Breadcrumbs.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/config/routes";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Data Pasien",
  new: "Tambah Baru",
  edit: "Ubah",
  registrations: "Pendaftaran",
  queues: "Antrian",
  "queue-display": "Layar TV Antrian",
  visits: "Kunjungan Medis",
  "medical-records": "Rekam Medis",
  prescriptions: "Resep Elektronik",
  pharmacy: "Farmasi & Obat",
  medicines: "Katalog Obat",
  inventory: "Stok & Inventori",
  movements: "Kartu Stok",
  suppliers: "Supplier",
  purchases: "Pembelian (PO)",
  billing: "Billing / Tagihan",
  payments: "Pembayaran Kasir",
  reports: "Laporan",
  revenue: "Pendapatan",
  doctors: "Dokter & Jadwal",
  departments: "Poliklinik",
  services: "Layanan Medis",
  procedures: "Tindakan Medis",
  payers: "Penjamin / Asuransi",
  users: "Manajemen Pengguna",
  settings: "Pengaturan",
  clinic: "Profil Klinik",
  roles: "Role & Hak Akses",
  "audit-logs": "Audit Log",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === "/" || pathname === "/login") return null;

  return (
    <nav className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
      <Link href={ROUTES.DASHBOARD} className="flex items-center hover:text-blue-600 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = ROUTE_LABELS[segment] || (segment.startsWith("pat-") || segment.startsWith("doc-") || segment.startsWith("vst-") || segment.startsWith("inv-") || segment.startsWith("po-") || segment.startsWith("rx-") ? "Detail" : segment);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 font-semibold truncate max-w-[160px]">{label}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600 transition-colors truncate max-w-[120px]">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
`);

// 2. UserMenu.tsx
writeFile("src/components/navigation/UserMenu.tsx", `
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
    toast.success(\`Beralih peran ke: \${newRole}\`);
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
`);

// 3. CommandSearch.tsx (Ctrl+K / Cmd+K Global Search)
writeFile("src/components/navigation/CommandSearch.tsx", `
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, FileText, Pill, Stethoscope, Receipt, Building2, ArrowRight } from "lucide-react";
import { patientService, doctorService, medicineService, billingService } from "@/services";
import { ROUTES } from "@/config/routes";

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const [patients, setPatients] = React.useState<any[]>([]);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [medicines, setMedicines] = React.useState<any[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (open) {
      patientService.getAll().then(setPatients);
      doctorService.getAll().then(setDoctors);
      medicineService.getAll().then(setMedicines);
    }
  }, [open]);

  const filteredPatients = query.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          p.mrNumber.toLowerCase().includes(query.toLowerCase()) ||
          p.nik.includes(query)
      ).slice(0, 4)
    : [];

  const filteredDoctors = query.trim()
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.specialization.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredMedicines = query.trim()
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/75 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-colors w-44 sm:w-64 justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Cari pasien, obat, dokter...</span>
        </div>
        <kbd className="pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1 text-[10px] font-mono font-medium text-slate-400">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-xl overflow-hidden gap-0 border-slate-200 shadow-2xl">
          <div className="flex items-center border-b border-slate-200 px-3">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama pasien, No RM, nama obat, atau dokter..."
              className="border-0 focus-visible:ring-0 text-sm px-0 py-3 shadow-none bg-transparent"
              autoFocus
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
            {query.trim() === "" ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Ketik kata kunci untuk mencari seluruh modul dalam sistem klinik.
              </div>
            ) : (
              <>
                {/* Patients Result */}
                {filteredPatients.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Pasien</div>
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(ROUTES.PATIENTS.DETAIL(p.id))}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{p.fullName}</p>
                            <p className="text-[11px] text-slate-500">{p.mrNumber} • NIK: {p.nik}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Doctors Result */}
                {filteredDoctors.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Dokter</div>
                    {filteredDoctors.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect(ROUTES.MASTER.DOCTORS)}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{d.name}</p>
                            <p className="text-[11px] text-slate-500">{d.specialization} • {d.departmentName}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Medicines Result */}
                {filteredMedicines.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Obat & Farmasi</div>
                    {filteredMedicines.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(ROUTES.MEDICINES.DETAIL(m.id))}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">{m.name}</p>
                            <p className="text-[11px] text-slate-500">{m.code} • Stok: {m.currentStock} {m.unit}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {filteredPatients.length === 0 && filteredDoctors.length === 0 && filteredMedicines.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Tidak ada hasil yang cocok dengan &quot;<strong>{query}</strong>&quot;.
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
`);

// 4. Sidebar.tsx
writeFile("src/components/navigation/Sidebar.tsx", `
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
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
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
                          ? "bg-blue-600 text-white shadow-xs font-semibold"
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
`);

// 5. Header.tsx
writeFile("src/components/navigation/Header.tsx", `
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
`);

// 6. AppShell.tsx
writeFile("src/components/navigation/AppShell.tsx", `
"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
`);

console.log("Finished generating Navigation & AppShell components.");
