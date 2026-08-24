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
