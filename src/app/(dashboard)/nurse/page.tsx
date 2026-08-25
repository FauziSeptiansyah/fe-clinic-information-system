"use client";

import * as React from "react";
import Link from "next/link";
import { visitService } from "@/services";
import { Visit } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/Displays";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { HeartPulse, ArrowRight, Pill } from "lucide-react";
import { ROUTES } from "@/config/routes";

function VisitRow({ visit, actionLabel }: { visit: Visit; actionLabel: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={visit.patientName} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {visit.patientName}
            <span className="ml-1.5 text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {visit.queueNumber}
            </span>
          </p>
          <p className="text-xs text-slate-500 truncate">{visit.departmentName} • {visit.doctorName}</p>
        </div>
      </div>
      <Link href={ROUTES.NURSE.DETAIL(visit.id)}>
        <Button size="sm" className="text-xs h-8 font-semibold shrink-0">
          {actionLabel} <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

export default function NurseWorklistPage() {
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    visitService.getAll().then((all) => {
      if (cancelled) return;
      setVisits(all);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const triageList = visits.filter((v) => v.status === "WAITING_NURSE");
  const followUpList = visits.filter((v) => v.status === "WAITING_FOLLOW_UP");

  return (
    <PageContainer>
      <PageHeader
        title="Triase & Tindak Lanjut"
        description="Pasien yang perlu pemeriksaan awal, dan pasien yang baru selesai diperiksa dokter."
      />

      {isLoading ? (
        <LoadingState title="Memuat worklist..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-blue-600" />
                Menunggu Triase ({triageList.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Belum diperiksa perawat.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {triageList.length === 0 ? (
                <EmptyState icon={HeartPulse} title="Tidak ada pasien" description="Belum ada pasien yang menunggu triase." className="min-h-[200px] border-0" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {triageList.map((v) => (
                    <VisitRow key={v.id} visit={v} actionLabel="Triase" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-purple-600" />
                Menunggu Tindak Lanjut ({followUpList.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Sudah diperiksa dokter, perlu konfirmasi tindak lanjut.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {followUpList.length === 0 ? (
                <EmptyState icon={Pill} title="Tidak ada pasien" description="Belum ada pasien yang menunggu tindak lanjut." className="min-h-[200px] border-0" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {followUpList.map((v) => (
                    <VisitRow key={v.id} visit={v} actionLabel="Follow-up" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
