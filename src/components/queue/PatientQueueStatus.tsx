"use client";

import Link from "next/link";
import { Queue } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useQueueStore } from "@/stores/queueStore";
import { useQueueTimeoutWatcher } from "@/hooks/useQueueTimeoutWatcher";
import { QUEUE_MAX_CALL_ATTEMPTS } from "@/config/queueConfig";
import { ROUTES } from "@/config/routes";
import { Tv, Users, BellRing } from "lucide-react";

/** Live "my queue number" view for a logged-in patient: their status plus what's currently being called clinic-wide. */
export function PatientQueueStatus({ myQueue }: { myQueue: Queue }) {
  const queues = useQueueStore((s) => s.queues);
  useQueueTimeoutWatcher();

  const currentCalled = queues.find((q) => q.departmentId === myQueue.departmentId && (q.status === "CALLED" || q.status === "IN_SERVICE"));
  const aheadCount = queues.filter(
    (q) =>
      q.departmentId === myQueue.departmentId &&
      (q.status === "WAITING" || q.status === "CALLED") &&
      new Date(q.createdAt).getTime() < new Date(myQueue.createdAt).getTime()
  ).length;

  const isMyTurn = currentCalled?.id === myQueue.id;

  return (
    <Card className={isMyTurn ? "border-blue-400 shadow-md shadow-blue-500/10" : "border-slate-200"}>
      <CardContent className="p-5 space-y-4">
        {isMyTurn && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 w-fit animate-pulse">
            <BellRing className="h-3.5 w-3.5" />
            Giliran Anda sekarang — silakan menuju ruangan
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Nomor Antrian Anda</p>
            <p className="text-3xl font-extrabold text-blue-600 font-mono tracking-tight">{myQueue.queueNumber}</p>
          </div>
          <div className="text-right space-y-1">
            <StatusBadge status={myQueue.status} type="queue" />
            {myQueue.status === "CALLED" && (myQueue.callCount || 0) > 0 && (
              <p className="text-[10px] text-amber-600 font-semibold">
                Panggilan ke-{myQueue.callCount}/{QUEUE_MAX_CALL_ATTEMPTS}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1 pt-3 border-t border-slate-100">
          <p>{myQueue.departmentName} — {myQueue.doctorName}</p>
          <p className="text-slate-400">{myQueue.serviceName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <BellRing className="h-3 w-3" /> Sedang Dipanggil
            </p>
            <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
              {currentCalled ? currentCalled.queueNumber : "—"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" /> Antrian di Depan Anda
            </p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{aheadCount} orang</p>
          </div>
        </div>

        <Link href={ROUTES.QUEUES.DISPLAY} className="block pt-1">
          <Button type="button" variant="outline" size="sm" className="w-full text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50">
            <Tv className="h-3.5 w-3.5 mr-1.5" />
            Buka Layar Antrian Penuh
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
