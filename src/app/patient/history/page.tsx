"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { DateTimeDisplay } from "@/components/common/Displays";
import { History } from "lucide-react";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";

export default function PatientHistoryPage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const setQueues = useQueueStore((s) => s.setQueues);
  const queues = useQueueStore((s) => s.queues);

  React.useEffect(() => {
    queueService.getAll().then(setQueues);
  }, [setQueues]);

  if (!patient) return null;

  const myHistory = queues
    .filter((q) => q.patientId === patient.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Riwayat Antrean</h1>
        <p className="text-sm text-slate-500 mt-1">Seluruh riwayat pengambilan nomor antrean Anda.</p>
      </div>

      {myHistory.length === 0 ? (
        <EmptyState icon={History} title="Belum ada riwayat" description="Riwayat antrean Anda akan muncul di sini setelah Anda mengambil nomor antrean." />
      ) : (
        <div className="space-y-3">
          {myHistory.map((q) => (
            <Card key={q.id} className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-blue-600 font-mono">{q.queueNumber}</span>
                    <StatusBadge status={q.status} type="queue" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 truncate">{q.departmentName} — {q.doctorName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <DateTimeDisplay date={q.createdAt} />
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
