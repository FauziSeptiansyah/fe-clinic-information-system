"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, Pill, CheckCircle2, ArrowRight, FileText } from "lucide-react";
import { StatCard, UserAvatar } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { visitService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Visit, User } from "@/types";

export function NurseDashboard({ user }: { user: User | null }) {
  const [visits, setVisits] = React.useState<Visit[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    visitService.getAll().then((vs) => {
      if (!cancelled) setVisits(vs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waitingTriage = visits.filter((v) => v.status === "WAITING_NURSE");
  const waitingFollowUp = visits.filter((v) => v.status === "WAITING_FOLLOW_UP");
  const completedToday = visits.filter((v) => v.status === "COMPLETED");
  const worklist = [...waitingTriage, ...waitingFollowUp];

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Perawat"}
        role="NURSE"
        subtitle="Triase Awal & Tindak Lanjut Pasien"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Menunggu Triase" value={waitingTriage.length} description="Belum diperiksa perawat" icon={HeartPulse} />
        <StatCard title="Menunggu Tindak Lanjut" value={waitingFollowUp.length} description="Sudah diperiksa dokter" icon={Pill} />
        <StatCard title="Selesai Hari Ini" value={completedToday.length} description="Kunjungan yang sudah selesai" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-blue-600" />
                Worklist Perawat
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Pasien yang perlu triase atau tindak lanjut</CardDescription>
            </div>
            <Link href={ROUTES.NURSE.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Buka Worklist <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {worklist.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Tidak ada pasien di worklist Anda saat ini.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {worklist.slice(0, 6).map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={v.patientName} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                          {v.patientName}
                          <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {v.queueNumber}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">{v.departmentName} • {v.doctorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={v.status} type="visit" />
                      <Link href={ROUTES.NURSE.DETAIL(v.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          {v.status === "WAITING_NURSE" ? "Triase" : "Follow-up"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <QuickActionsCard
          title="Aksi Cepat Perawat"
          actions={[
            { label: "Triase & Tindak Lanjut", href: ROUTES.NURSE.LIST, icon: HeartPulse, iconClassName: "text-blue-600" },
            { label: "Rekam Medis", href: ROUTES.MEDICAL_RECORDS.LIST, icon: FileText, iconClassName: "text-slate-600" },
          ]}
        />
      </div>
    </>
  );
}
