"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  ListOrdered,
  CreditCard,
  Plus,
  Tv,
  UserCog,
  Settings,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { StatCard, UserAvatar } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import {
  patientService,
  queueService,
  visitService,
  medicineService,
  paymentService,
} from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Patient, Medicine, Visit, User } from "@/types";

export function AdminDashboard({ user }: { user: User | null }) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [revenue, setRevenue] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      patientService.getAll(),
      queueService.getAll(),
      visitService.getAll(),
      medicineService.getAll(),
      paymentService.getAll(),
    ]).then(([pts, qs, vs, meds, pays]) => {
      if (cancelled) return;
      setPatients(pts);
      setQueues(qs);
      setVisits(vs);
      setMedicines(meds);
      setRevenue(pays.reduce((sum, p) => sum + p.amount, 0));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeQueues = queues.filter((q) => q.status === "WAITING" || q.status === "CALLED" || q.status === "IN_SERVICE");
  const lowStockMeds = medicines.filter((m) => m.currentStock <= m.minimumStock);

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Admin"}
        role="ADMIN"
        subtitle="Sistem Informasi Manajemen Klinik Pratama Sehat Bersama"
        actions={
          <>
            <Link href={ROUTES.REGISTRATIONS.NEW}>
              <Button size="sm" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs shadow-xs">
                <Plus className="h-4 w-4 mr-1.5" />
                Daftar Pasien
              </Button>
            </Link>
            <Link href={ROUTES.QUEUES.DISPLAY}>
              <Button size="sm" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white font-semibold text-xs">
                <Tv className="h-4 w-4 mr-1.5" />
                Layar Antrian TV
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pasien Terdaftar" value={patients.length} description="Pasien aktif dalam rekam medis" icon={Users} />
        <StatCard title="Kunjungan Hari Ini" value={visits.length} description="Total pasien registrasi hari ini" icon={Calendar} />
        <StatCard title="Antrian Berjalan" value={activeQueues.length} description="Menunggu & sedang diperiksa" icon={ListOrdered} />
        <StatCard
          title="Total Pendapatan (Kasir)"
          value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(revenue)}
          description="Penerimaan tunai, QRIS & asuransi"
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-blue-600" />
                Antrian Poliklinik Saat Ini
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Daftar antrian pasien yang sedang menunggu atau dipanggil
              </CardDescription>
            </div>
            <Link href={ROUTES.QUEUES.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activeQueues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Tidak ada antrian aktif saat ini.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeQueues.slice(0, 6).map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={q.patientName} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                          {q.patientName}
                          <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {q.queueNumber}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">{q.departmentName} • {q.doctorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={q.status} type="queue" />
                      <Link href={ROUTES.QUEUES.LIST}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Proses</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xs border-amber-200 bg-amber-50/20">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Peringatan Stok Obat Menipis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              {lowStockMeds.length === 0 ? (
                <p className="text-xs text-slate-500">Seluruh stok obat berada dalam batas aman.</p>
              ) : (
                lowStockMeds.slice(0, 3).map((med) => (
                  <div key={med.id} className="flex items-center justify-between bg-white p-2.5 rounded border border-amber-200 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-red-600 font-medium">Sisa: {med.currentStock} {med.unit} (Min: {med.minimumStock})</p>
                    </div>
                  </div>
                ))
              )}
              <Link href={ROUTES.INVENTORY.LIST} className="block pt-1 text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">Kelola Seluruh Inventori & FEFO →</span>
              </Link>
            </CardContent>
          </Card>

          <QuickActionsCard
            title="Aksi Cepat Administrasi"
            actions={[
              { label: "Registrasi Pasien Baru", href: ROUTES.REGISTRATIONS.NEW, icon: Plus, iconClassName: "text-blue-600" },
              { label: "Kelola Pengguna & Role", href: ROUTES.MASTER.USERS, icon: UserCog, iconClassName: "text-violet-600" },
              { label: "Laporan Pendapatan", href: ROUTES.REPORTS.REVENUE, icon: CreditCard, iconClassName: "text-emerald-600" },
              { label: "Pengaturan Klinik", href: ROUTES.SETTINGS.CLINIC, icon: Settings, iconClassName: "text-slate-600" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
