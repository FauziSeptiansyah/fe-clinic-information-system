"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, ListOrdered, Clock, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { StatCard, UserAvatar } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { queueService, visitService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Visit, User } from "@/types";

export function NurseDashboard({ user }: { user: User | null }) {
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([queueService.getAll(), visitService.getAll()]).then(([qs, vs]) => {
      if (cancelled) return;
      setQueues(qs);
      setVisits(vs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waiting = queues.filter((q) => q.status === "WAITING");
  const inService = queues.filter((q) => q.status === "CALLED" || q.status === "IN_SERVICE");
  const completedToday = visits.filter((v) => v.status === "COMPLETED");
  const activeQueues = [...waiting, ...inService];

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Perawat"}
        role="NURSE"
        subtitle="Persiapan Pasien & Tanda Vital"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Menunggu Persiapan" value={waiting.length} description="Pasien belum dipanggil" icon={ListOrdered} />
        <StatCard title="Sedang Diperiksa" value={inService.length} description="Dipanggil & di ruang periksa" icon={Clock} />
        <StatCard title="Selesai Hari Ini" value={completedToday.length} description="Kunjungan yang sudah selesai" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-blue-600" />
                Antrian Persiapan Pasien
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Panggil & siapkan pasien sebelum diperiksa dokter</CardDescription>
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

        <QuickActionsCard
          title="Aksi Cepat Perawat"
          actions={[
            { label: "Kelola Antrian", href: ROUTES.QUEUES.LIST, icon: ListOrdered, iconClassName: "text-blue-600" },
            { label: "Kunjungan & Periksa", href: ROUTES.VISITS.LIST, icon: HeartPulse, iconClassName: "text-emerald-600" },
            { label: "Rekam Medis", href: ROUTES.MEDICAL_RECORDS.LIST, icon: FileText, iconClassName: "text-slate-600" },
          ]}
        />
      </div>
    </>
  );
}
