"use client";

import * as React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield, Activity, Users, ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function SettingsHubPage() {
  const settingLinks = [
    {
      title: "Profil & Identitas Klinik",
      description: "Nama klinik, SIPA/Izin Operasional Kemenkes, alamat, nomor kontak, logo, dan jam operasional.",
      href: ROUTES.SETTINGS.CLINIC,
      icon: Building2,
    },
    {
      title: "Hak Akses & Otorisasi Peran",
      description: "Matriks izin (permissions) per peran: Dokter, Perawat, Apoteker, Kasir, Resepsionis, dan Owner.",
      href: ROUTES.SETTINGS.ROLES,
      icon: Shield,
    },
    {
      title: "Audit Log & Jejak Aktivitas",
      description: "Catatan histori setiap perubahan data rekam medis, billing, mutasi obat, dan login staf.",
      href: ROUTES.SETTINGS.AUDIT_LOGS,
      icon: Activity,
    },
    {
      title: "Manajemen Pengguna Staf",
      description: "Pengaturan akun pengguna, kata sandi, dan status keaktifan akun.",
      href: ROUTES.MASTER.USERS,
      icon: Users,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Pengaturan Sistem Klinik"
        description="Konfigurasi identitas fasilitas kesehatan, hak akses keamanan, dan audit kepatuhan sistem."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
