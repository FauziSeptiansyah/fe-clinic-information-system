"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ListOrdered, Plus, Tv, ClipboardCheck, ArrowRight, UserCheck } from "lucide-react";
import { StatCard, UserAvatar, DateTimeDisplay } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { patientService, queueService, patientChangeRequestService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Patient, PatientChangeRequest, User } from "@/types";

export function ReceptionistDashboard({ user }: { user: User | null }) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [changeRequests, setChangeRequests] = React.useState<PatientChangeRequest[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([patientService.getAll(), queueService.getAll(), patientChangeRequestService.getAll()]).then(
      ([pts, qs, crs]) => {
        if (cancelled) return;
        setPatients(pts);
        setQueues(qs);
        setChangeRequests(crs);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const waiting = queues.filter((q) => q.status === "WAITING");
  const called = queues.filter((q) => q.status === "CALLED" || q.status === "IN_SERVICE");
  const pendingChangeRequests = changeRequests.filter((r) => r.status === "PENDING");
  const activeQueues = [...waiting, ...called];

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Resepsionis"}
        role="RECEPTIONIST"
        subtitle="Pendaftaran & Loket Depan Klinik Pratama Sehat Bersama"
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
        <StatCard title="Menunggu Panggilan" value={waiting.length} description="Antrian belum dipanggil" icon={ListOrdered} />
        <StatCard title="Sedang Dilayani" value={called.length} description="Dipanggil & sedang diperiksa" icon={UserCheck} />
        <StatCard title="Total Pasien Terdaftar" value={patients.length} description="Pasien aktif dalam rekam medis" icon={Users} />
        <StatCard
          title="Permintaan Perubahan Data"
          value={pendingChangeRequests.length}
          description="Menunggu konfirmasi CS"
          icon={ClipboardCheck}
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
              <CardDescription className="text-xs text-slate-500">Kelola panggilan & status antrian pasien</CardDescription>
            </div>
            <Link href={ROUTES.QUEUES.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Kelola Antrian <ArrowRight className="h-3.5 w-3.5 ml-1" />
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
                    <StatusBadge status={q.status} type="queue" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-amber-600" />
                Permintaan Perubahan Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-2.5">
              {pendingChangeRequests.length === 0 ? (
                <EmptyState
                  icon={ClipboardCheck}
                  title="Tidak ada permintaan"
                  description="Belum ada perubahan data pasien yang menunggu konfirmasi."
                  className="min-h-0 border-0 p-0"
                />
              ) : (
                pendingChangeRequests.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{r.patientName}</p>
                      <p className="text-[11px] text-slate-500">
                        <DateTimeDisplay date={r.requestedAt} />
                      </p>
                    </div>
                    <Badge variant="warning" className="text-[10px] shrink-0">PENDING</Badge>
                  </div>
                ))
              )}
              <Link href={ROUTES.PATIENTS.CHANGE_REQUESTS} className="block pt-1 text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">Kelola Semua Permintaan →</span>
              </Link>
            </CardContent>
          </Card>

          <QuickActionsCard
            title="Aksi Cepat Loket"
            actions={[
              { label: "Registrasi Pasien Baru", href: ROUTES.REGISTRATIONS.NEW, icon: Plus, iconClassName: "text-blue-600" },
              { label: "Kelola Antrian", href: ROUTES.QUEUES.LIST, icon: ListOrdered, iconClassName: "text-emerald-600" },
              { label: "Data Pasien", href: ROUTES.PATIENTS.LIST, icon: Users, iconClassName: "text-violet-600" },
              { label: "Konfirmasi Perubahan Data", href: ROUTES.PATIENTS.CHANGE_REQUESTS, icon: ClipboardCheck, iconClassName: "text-amber-600" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
