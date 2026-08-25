"use client";

import * as React from "react";
import {
  Users,
  Calendar,
  ListOrdered,
  CreditCard,
  UserCog,
  Settings,
  Building2,
  History,
} from "lucide-react";
import { StatCard } from "@/components/common/Displays";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { patientService, queueService, visitService, paymentService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Patient, Visit, User } from "@/types";

export function AdminDashboard({ user }: { user: User | null }) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [revenue, setRevenue] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      patientService.getAll(),
      queueService.getAll(),
      visitService.getAll(),
      paymentService.getAll(),
    ]).then(([pts, qs, vs, pays]) => {
      if (cancelled) return;
      setPatients(pts);
      setQueues(qs);
      setVisits(vs);
      setRevenue(pays.reduce((sum, p) => sum + p.amount, 0));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeQueues = queues.filter((q) => q.status === "WAITING" || q.status === "CALLED" || q.status === "IN_SERVICE");

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Admin"}
        role="ADMIN"
        subtitle="Administrasi Sistem — Bukan Bagian dari Alur Pelayanan Pasien"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pasien Terdaftar" value={patients.length} description="Pasien aktif dalam rekam medis" icon={Users} />
        <StatCard title="Kunjungan Hari Ini" value={visits.length} description="Total kunjungan berjalan" icon={Calendar} />
        <StatCard title="Antrian Berjalan" value={activeQueues.length} description="Menunggu & sedang diproses CS" icon={ListOrdered} />
        <StatCard
          title="Total Pendapatan (Kasir)"
          value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(revenue)}
          description="Penerimaan tunai, QRIS & asuransi"
          icon={CreditCard}
        />
      </div>

      <QuickActionsCard
        title="Administrasi Sistem"
        actions={[
          { label: "Kelola Pengguna & Role Staf", href: ROUTES.MASTER.USERS, icon: UserCog, iconClassName: "text-violet-600" },
          { label: "Master Data (Poli, Layanan, Jadwal)", href: ROUTES.MASTER.DOCTORS, icon: Building2, iconClassName: "text-blue-600" },
          { label: "Pengaturan Klinik", href: ROUTES.SETTINGS.CLINIC, icon: Settings, iconClassName: "text-slate-600" },
          { label: "Log Aktivitas Sistem", href: ROUTES.SETTINGS.AUDIT_LOGS, icon: History, iconClassName: "text-amber-600" },
        ]}
      />
    </>
  );
}
