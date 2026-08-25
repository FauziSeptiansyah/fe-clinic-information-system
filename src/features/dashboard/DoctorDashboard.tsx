"use client";

import * as React from "react";
import Link from "next/link";
import { Stethoscope, ListOrdered, Clock, CheckCircle2, FileText, Pill, ArrowRight } from "lucide-react";
import { StatCard, UserAvatar } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { queueService, visitService, doctorService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Visit, Doctor, User } from "@/types";

export function DoctorDashboard({ user }: { user: User | null }) {
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [myDoctorId, setMyDoctorId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([queueService.getAll(), visitService.getAll(), doctorService.getAll()]).then(
      ([qs, vs, docs]: [Queue[], Visit[], Doctor[]]) => {
        if (cancelled) return;
        setQueues(qs);
        setVisits(vs);
        const matched = user?.name ? docs.find((d) => user.name.startsWith(d.name)) : undefined;
        setMyDoctorId(matched?.id || null);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [user?.name]);

  const myQueues = myDoctorId ? queues.filter((q) => q.doctorId === myDoctorId) : queues;
  const myVisits = myDoctorId ? visits.filter((v) => v.doctorId === myDoctorId) : visits;
  const waiting = myQueues.filter((q) => q.status === "WAITING");
  const inService = myQueues.filter((q) => q.status === "CALLED" || q.status === "IN_SERVICE");
  const completedToday = myVisits.filter((v) => v.status === "COMPLETED");
  const activeQueues = [...waiting, ...inService];

  const visitByQueueId = React.useMemo(() => {
    const map = new Map<string, Visit>();
    myVisits.forEach((v) => map.set(v.queueId, v));
    return map;
  }, [myVisits]);

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Dokter"}
        role="DOCTOR"
        subtitle="Praktik & Pemeriksaan Pasien"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Menunggu Giliran" value={waiting.length} description="Pasien belum dipanggil" icon={ListOrdered} />
        <StatCard title="Sedang Diperiksa" value={inService.length} description="Dipanggil & di ruang periksa" icon={Clock} />
        <StatCard title="Selesai Diperiksa" value={completedToday.length} description="Pemeriksaan hari ini" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Pasien Saya Hari Ini
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Antrian pasien yang menunggu atau sedang Anda periksa</CardDescription>
            </div>
            <Link href={ROUTES.VISITS.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Semua Kunjungan <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activeQueues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Tidak ada pasien menunggu pemeriksaan Anda saat ini.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeQueues.slice(0, 6).map((q) => {
                  const visit = visitByQueueId.get(q.id);
                  return (
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
                          <p className="text-xs text-slate-500">{q.departmentName} • {q.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={q.status} type="queue" />
                        {visit && (
                          <Link href={ROUTES.VISITS.DETAIL(visit.id)}>
                            <Button size="sm" variant="outline" className="text-xs h-8">Periksa</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <QuickActionsCard
          title="Aksi Cepat Klinis"
          actions={[
            { label: "Kunjungan & Periksa", href: ROUTES.VISITS.LIST, icon: Stethoscope, iconClassName: "text-blue-600" },
            { label: "Rekam Medis", href: ROUTES.MEDICAL_RECORDS.LIST, icon: FileText, iconClassName: "text-emerald-600" },
            { label: "Resep Elektronik", href: ROUTES.PRESCRIPTIONS.LIST, icon: Pill, iconClassName: "text-purple-600" },
          ]}
        />
      </div>
    </>
  );
}
