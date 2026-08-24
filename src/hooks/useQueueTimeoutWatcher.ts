"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { QUEUE_CALL_TIMEOUT_MINUTES, QUEUE_MAX_CALL_ATTEMPTS } from "@/config/queueConfig";

/**
 * Polls WAITING-turned-CALLED queue numbers: if nobody starts service within
 * QUEUE_CALL_TIMEOUT_MINUTES, re-calls the number; after QUEUE_MAX_CALL_ATTEMPTS
 * unanswered calls, auto-skips it. Mount this on any page that should "drive" the
 * clinic's live queue clock (staff board, TV display, a patient's own status view).
 *
 * Runs against this tab's own copy of the mock queue data (this app has no shared
 * backend), so the effect is only visible in tabs that have this hook mounted.
 */
export function useQueueTimeoutWatcher(enabled: boolean = true) {
  const queues = useQueueStore((s) => s.queues);
  const updateQueueStatus = useQueueStore((s) => s.updateQueueStatus);
  const inFlightRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      const now = Date.now();

      for (const q of queues) {
        if (q.status !== "CALLED" || !q.calledAt) continue;
        if (inFlightRef.current.has(q.id)) continue;

        const elapsedMinutes = (now - new Date(q.calledAt).getTime()) / 60000;
        if (elapsedMinutes < QUEUE_CALL_TIMEOUT_MINUTES) continue;

        const callCount = q.callCount || 1;
        inFlightRef.current.add(q.id);

        const finish = async () => {
          try {
            if (callCount >= QUEUE_MAX_CALL_ATTEMPTS) {
              await queueService.updateStatus(q.id, "SKIPPED");
              updateQueueStatus(q.id, "SKIPPED");
              toast.info(`Antrian ${q.queueNumber} dilewati otomatis — ${QUEUE_MAX_CALL_ATTEMPTS}x panggilan tidak direspon.`);
            } else {
              await queueService.updateStatus(q.id, "CALLED");
              updateQueueStatus(q.id, "CALLED");
              toast.info(`Memanggil ulang nomor ${q.queueNumber} (panggilan ke-${callCount + 1}).`);
            }
          } finally {
            inFlightRef.current.delete(q.id);
          }
        };
        finish();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [queues, updateQueueStatus, enabled]);
}
