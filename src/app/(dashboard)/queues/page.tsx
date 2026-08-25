"use client";

import * as React from "react";
import Link from "next/link";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue } from "@/types";
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
  UserCheck2,
  UserX,
  Tv,
  Plus,
  RefreshCw,
  Globe,
  MonitorSmartphone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useQueueTimeoutWatcher } from "@/hooks/useQueueTimeoutWatcher";
import { QUEUE_CALL_TIMEOUT_MINUTES, QUEUE_MAX_CALL_ATTEMPTS } from "@/config/queueConfig";

const SOURCE_META: Record<Queue["source"], { label: string; icon: typeof Globe }> = {
  ONLINE: { label: "Online", icon: Globe },
  KIOSK: { label: "Kiosk", icon: MonitorSmartphone },
  STAFF: { label: "Loket", icon: UserRound },
};

function SourceBadge({ source }: { source: Queue["source"] }) {
  const meta = SOURCE_META[source];
  return (
    <Badge variant="outline" className="text-[10px] gap-1 font-medium text-slate-500">
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export default function QueuesBoardPage() {
  const { queues, setQueues, updateQueue } = useQueueStore();
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("ALL");
  useQueueTimeoutWatcher();

  const fetchQueues = React.useCallback(async () => {
    const data = await queueService.getAll();
    setQueues(data);
  }, [setQueues]);

  React.useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleCall = async (queue: Queue) => {
    try {
      const updated = await queueService.callQueue(queue.id);
      updateQueue(updated);
      toast.success(`Memanggil nomor antrian ${queue.queueNumber} menuju ${queue.departmentName}.`);
    } catch {
      toast.error("Gagal memanggil antrian.");
    }
  };

  const handleNoShow = async (queue: Queue) => {
    try {
      const updated = await queueService.markNoShow(queue.id);
      updateQueue(updated);
      toast.info(`Antrian ${queue.queueNumber} ditandai tidak hadir.`);
    } catch {
      toast.error("Gagal memperbarui status antrian.");
    }
  };

  const departments = Array.from(new Set(queues.map((q) => q.departmentName)));

  const filteredQueues = queues.filter((q) => {
    if (selectedDepartment !== "ALL") return q.departmentName === selectedDepartment;
    return true;
  });

  const waitingList = filteredQueues.filter((q) => q.status === "WAITING");
  const processingList = filteredQueues.filter((q) => q.status === "CALLED" || q.status === "IN_SERVICE");
  const doneList = filteredQueues.filter((q) => q.status === "COMPLETED" || q.status === "NO_SHOW" || q.status === "CANCELLED");

  return (
    <PageContainer>
      <PageHeader
        title="Customer Service — Antrean Depan"
        description="Panggil nomor antrean, lalu identifikasi & lengkapi data pasien sebelum diteruskan ke perawat."
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
                Ambil Nomor (Walk-in)
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

      {/* 3 Column Board: Menunggu -> Dipanggil/Diproses -> Selesai */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Menunggu Dipanggil */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">Menunggu Dipanggil</span>
              <Badge variant="warning" className="text-xs">{waitingList.length}</Badge>
            </div>
            <p className="text-[10px] text-amber-700">
              Panggil ulang otomatis tiap {QUEUE_CALL_TIMEOUT_MINUTES} menit, tidak hadir setelah {QUEUE_MAX_CALL_ATTEMPTS}x tidak direspon.
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
                      <SourceBadge source={q.source} />
                    </div>

                    <div className="flex items-center gap-3">
                      <UserAvatar name={q.patientName} size="md" />
                      <div className="min-w-0">
                        <p className={"text-sm font-bold truncate " + (q.patientId ? "text-slate-900" : "text-slate-500 italic")}>
                          {q.patientName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{q.patientMrNumber} • {q.payerType}</p>
                        <p className="text-xs text-slate-700 mt-1 truncate">{q.departmentName} — {q.doctorName}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        onClick={() => handleCall(q)}
                        className="text-xs h-8 w-full bg-blue-600 hover:bg-blue-700 font-semibold"
                      >
                        <Volume2 className="h-3.5 w-3.5 mr-1" />
                        Panggil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Dipanggil / Sedang Diproses CS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 border border-cyan-200">
            <span className="text-xs font-bold text-cyan-900 uppercase">Dipanggil / Diproses</span>
            <Badge variant="info" className="text-xs">{processingList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {processingList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Tidak ada pasien yang sedang dipanggil
              </div>
            ) : (
              processingList.map((q) => (
                <Card key={q.id} className="shadow-xs border-cyan-200 bg-cyan-50/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-cyan-700 font-mono">{q.queueNumber}</span>
                      <div className="flex items-center gap-1.5">
                        {(q.callCount || 0) > 0 && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                            Panggilan ke-{q.callCount}/{QUEUE_MAX_CALL_ATTEMPTS}
                          </Badge>
                        )}
                        <SourceBadge source={q.source} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserAvatar name={q.patientName} size="md" className="ring-2 ring-cyan-300" />
                      <div className="min-w-0">
                        <p className={"text-sm font-bold truncate " + (q.patientId ? "text-slate-900" : "text-slate-500 italic")}>
                          {q.patientName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{q.departmentName} • {q.doctorName}</p>
                        {!q.patientId && (
                          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Belum teridentifikasi</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <Link href={ROUTES.QUEUES.RECEIVE(q.id)} className="flex-1">
                        <Button size="sm" variant="default" className="w-full text-xs h-8 font-semibold">
                          <UserCheck2 className="h-3.5 w-3.5 mr-1" />
                          Terima Pasien
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNoShow(q)}
                        className="text-xs h-8 text-slate-500 border-slate-300 hover:bg-slate-50"
                        title="Tandai Tidak Hadir"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Selesai / Tidak Hadir / Batal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase">Selesai Diproses</span>
            <Badge variant="secondary" className="text-xs">{doneList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {doneList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Belum ada antrian yang selesai diproses
              </div>
            ) : (
              doneList.slice(0, 8).map((q) => (
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
