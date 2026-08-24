"use client";

import * as React from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_PERMISSIONS } from "@/config/permissionConfig";
import { Role } from "@/types";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

const ALL_ROLES: { role: Role; label: string; desc: string }[] = [
  { role: "ADMIN", label: "Administrator", desc: "Akses penuh ke seluruh konfigurasi master, audit, dan transaksi." },
  { role: "OWNER", label: "Pimpinan / Owner", desc: "Akses pemantauan dashboard eksekutif dan seluruh laporan keuangan." },
  { role: "RECEPTIONIST", label: "Resepsionis", desc: "Pendaftaran pasien, cetak tiket antrian, dan kelola biodata pasien." },
  { role: "DOCTOR", label: "Dokter Pemeriksa", desc: "Pemeriksaan medis SOAP, diagnosa ICD, tindakan, dan penulisan e-resep." },
  { role: "NURSE", label: "Perawat", desc: "Pemeriksaan tanda-tanda vital, triase awal, dan bantuan tindakan medis." },
  { role: "PHARMACIST", label: "Apoteker / Farmasi", desc: "Penyiapan resep obat, pemilihan batch FEFO, dan kartu stok mutasi." },
  { role: "CASHIER", label: "Kasir Pembayaran", desc: "Penerimaan kas, pelunasan tagihan klinik, dan cetak struk kwitansi." },
  { role: "WAREHOUSE", label: "Gudang Farmasi", desc: "Penerimaan PO obat distributor, batch expired, dan inventori." },
];

export default function RolesSettingsPage() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.SETTINGS.INDEX} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Pengaturan
        </Link>
      </div>

      <PageHeader
        title="Matriks Hak Akses & Keamanan Peran (RBAC)"
        description="Role-Based Access Control mengatur wewenang setiap peran staf sesuai protokol keamanan medis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALL_ROLES.map((item) => {
          const perms = ROLE_PERMISSIONS[item.role] || [];
          return (
            <Card key={item.role} className="shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{item.label}</span>
                  <Badge variant="outline" className="font-mono text-xs">{item.role}</Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Daftar Izin Akses ({perms.length} Permissions):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {perms.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {p}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
