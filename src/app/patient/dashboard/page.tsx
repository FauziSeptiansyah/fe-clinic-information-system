"use client";

import * as React from "react";
import Link from "next/link";
import { Ticket, ArrowRight, History as HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PatientQueueStatus } from "@/components/queue/PatientQueueStatus";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue } from "@/types";

const ACTIVE_STATUSES = new Set(["WAITING", "CALLED", "IN_SERVICE"]);

export default function PatientDashboardPage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const setQueues = useQueueStore((s) => s.setQueues);
  const queues = useQueueStore((s) => s.queues);

  React.useEffect(() => {
    queueService.getAll().then(setQueues);
  }, [setQueues]);

  if (!patient) return null;

  const myQueues: Queue[] = queues.filter((q) => q.patientId === patient.id);
  const myActiveQueue = myQueues.find((q) => ACTIVE_STATUSES.has(q.status));
  const recentHistory = myQueues
    .filter((q) => !ACTIVE_STATUSES.has(q.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Halo, {patient.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Selamat datang kembali di portal pasien.</p>
      </div>

      {myActiveQueue ? (
        <PatientQueueStatus myQueue={myActiveQueue} />
      ) : (
        <Link href={ROUTES.PATIENT.QUEUE} className="block">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0 shadow-lg shadow-blue-600/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Ambil Nomor Antrean</p>
                  <p className="text-xs text-blue-100">Belum ada antrean aktif hari ini</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <HistoryIcon className="h-4 w-4 text-slate-400" />
              Riwayat Terakhir
            </div>
            <Link href={ROUTES.PATIENT.HISTORY} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat kunjungan.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentHistory.map((q) => (
                <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 font-mono">{q.queueNumber}</p>
                    <p className="text-slate-500">{q.departmentName}</p>
                  </div>
                  <StatusBadge status={q.status} type="queue" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href={ROUTES.PATIENT.PROFILE}>
          <Button type="button" variant="outline" className="w-full text-xs font-semibold">
            Lihat Profil Saya
          </Button>
        </Link>
        <Link href={ROUTES.QUEUES.DISPLAY}>
          <Button type="button" variant="outline" className="w-full text-xs font-semibold">
            Layar Antrean TV
          </Button>
        </Link>
      </div>
    </div>
  );
}
