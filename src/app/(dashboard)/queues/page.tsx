"use client";

import * as React from "react";
import Link from "next/link";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue, QueueStatus } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UserAvatar } from "@/components/common/Displays";
import { EmptyQueueArt } from "@/components/illustrations/EmptyQueueArt";
import {
  Volume2,
  Play,
  SkipForward,
  CheckCircle,
  Tv,
  Plus,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useQueueTimeoutWatcher } from "@/hooks/useQueueTimeoutWatcher";
import { QUEUE_CALL_TIMEOUT_MINUTES, QUEUE_MAX_CALL_ATTEMPTS } from "@/config/queueConfig";

export default function QueuesBoardPage() {
  const { queues, setQueues, updateQueueStatus } = useQueueStore();
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("ALL");
  useQueueTimeoutWatcher();

  const fetchQueues = React.useCallback(async () => {
    const data = await queueService.getAll();
    setQueues(data);
  }, [setQueues]);

  React.useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleAction = async (queueId: string, action: QueueStatus, label: string) => {
    try {
      await queueService.updateStatus(queueId, action);
      updateQueueStatus(queueId, action);
      toast.success(`Antrian berhasil di-${label}.`);
    } catch {
      toast.error("Gagal memperbarui status antrian.");
    }
  };

  const handleCallAudio = (queue: Queue) => {
    handleAction(queue.id, "CALLED", "panggil");
    toast.info(`Memanggil nomor antrian: ${queue.queueNumber} menuju ${queue.departmentName}`);
  };

  const departments = Array.from(new Set(queues.map((q) => q.departmentName)));

  const filteredQueues = queues.filter((q) => {
    if (selectedDepartment !== "ALL") return q.departmentName === selectedDepartment;
    return true;
  });

  const waitingList = filteredQueues.filter((q) => q.status === "WAITING" || q.status === "CALLED");
  const inServiceList = filteredQueues.filter((q) => q.status === "IN_SERVICE");
  const completedList = filteredQueues.filter((q) => q.status === "COMPLETED" || q.status === "SKIPPED");

  return (
    <PageContainer>
      <PageHeader
        title="Papan Antrian Poliklinik (Live Queue)"
        description="Kelola panggilan pasien, mulai pemeriksaan, dan koordinasi antrian poli secara real-time."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchQueues} className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Segarkan
            </Button>
            <Link href={ROUTES.QUEUES.DISPLAY}>
              <Button variant="outline" size="sm" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50">
                <Tv className="h-3.5 w-3.5 mr-1.5" />
                Layar Antrian TV
              </Button>
            </Link>
            <Link href={ROUTES.REGISTRATIONS.NEW}>
              <Button size="sm" className="text-xs font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ambil Nomor Antrian
              </Button>
            </Link>
          </div>
        }
      />

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          variant={selectedDepartment === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDepartment("ALL")}
          className="text-xs rounded-full"
        >
          Semua Poliklinik ({queues.length})
        </Button>
        {departments.map((dept) => {
          const count = queues.filter((q) => q.departmentName === dept).length;
          return (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
              className="text-xs rounded-full"
            >
              {dept} ({count})
            </Button>
          );
        })}
      </div>

      {/* 3 Column Kanban Board: Waiting -> In Service -> Completed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Menunggu & Dipanggil */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">Menunggu / Dipanggil</span>
              <Badge variant="warning" className="text-xs">{waitingList.length}</Badge>
            </div>
            <p className="text-[10px] text-amber-700">
              Panggil ulang otomatis tiap {QUEUE_CALL_TIMEOUT_MINUTES} menit, dilewati setelah {QUEUE_MAX_CALL_ATTEMPTS}x tidak direspon.
            </p>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-lg flex flex-col items-center gap-2">
                <EmptyQueueArt className="h-16 w-auto opacity-80" />
                <p className="text-xs text-slate-400">Tidak ada antrian menunggu</p>
              </div>
            ) : (
              waitingList.map((q) => (
                <Card key={q.id} className="shadow-xs border-slate-200 hover:border-blue-300 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-blue-600 font-mono">{q.queueNumber}</span>
                      <div className="flex items-center gap-1.5">
                        {q.status === "CALLED" && (q.callCount || 0) > 0 && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                            Panggilan ke-{q.callCount}/{QUEUE_MAX_CALL_ATTEMPTS}
                          </Badge>
                        )}
                        <StatusBadge status={q.status} type="queue" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserAvatar name={q.patientName} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{q.patientName}</p>
                        <p className="text-xs text-slate-500 font-mono">{q.patientMrNumber} • {q.payerType}</p>
                        <p className="text-xs text-slate-700 mt-1 truncate">{q.departmentName} — {q.doctorName}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallAudio(q)}
                        className="text-xs h-8 flex-1 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                      >
                        <Volume2 className="h-3.5 w-3.5 mr-1" />
                        Panggil
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(q.id, "IN_SERVICE", "mulai periksa")}
                        className="text-xs h-8 flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Periksa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(q.id, "SKIPPED", "lewati")}
                        className="text-xs h-8 px-2 text-slate-500"
                        title="Lewati"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Sedang Dalam Pemeriksaan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-900 uppercase">Sedang Diperiksa</span>
            <Badge variant="default" className="text-xs">{inServiceList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {inServiceList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Tidak ada pasien sedang diperiksa
              </div>
            ) : (
              inServiceList.map((q) => (
                <Card key={q.id} className="shadow-xs border-blue-200 bg-blue-50/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-blue-700 font-mono">{q.queueNumber}</span>
                      <StatusBadge status={q.status} type="queue" />
                    </div>

                    <div className="flex items-center gap-3">
                      <UserAvatar name={q.patientName} size="md" className="ring-2 ring-blue-300" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{q.patientName}</p>
                        <p className="text-xs text-slate-500 truncate">{q.departmentName} • {q.doctorName}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <Link href={ROUTES.VISITS.LIST} className="flex-1">
                        <Button size="sm" variant="default" className="w-full text-xs h-8 font-semibold">
                          <Stethoscope className="h-3.5 w-3.5 mr-1" />
                          Buka SOAP Rekam Medis
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(q.id, "COMPLETED", "selesaikan")}
                        className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Selesai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Selesai / Dilewati */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase">Selesai / Dilewati</span>
            <Badge variant="secondary" className="text-xs">{completedList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {completedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Belum ada antrian selesai
              </div>
            ) : (
              completedList.slice(0, 8).map((q) => (
                <Card key={q.id} className="shadow-xs border-slate-200 opacity-80">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700 text-sm">{q.queueNumber}</span>
                      <StatusBadge status={q.status} type="queue" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 truncate">{q.patientName}</p>
                    <p className="text-[11px] text-slate-500">{q.departmentName}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
