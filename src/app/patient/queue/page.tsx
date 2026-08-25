"use client";

import * as React from "react";
import { PatientQueueStatus } from "@/components/queue/PatientQueueStatus";
import { RegistrationForm } from "@/features/registrations/RegistrationForm";
import { LoadingState } from "@/components/common/LoadingState";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue } from "@/types";

const ACTIVE_STATUSES = new Set(["WAITING", "CALLED", "IN_SERVICE"]);

export default function PatientQueuePage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const setQueues = useQueueStore((s) => s.setQueues);
  const queues = useQueueStore((s) => s.queues);

  React.useEffect(() => {
    queueService.getAll().then(setQueues);
  }, [setQueues]);

  const myActiveQueue: Queue | undefined = patient
    ? queues.find((q) => q.patientId === patient.id && ACTIVE_STATUSES.has(q.status))
    : undefined;

  if (!patient) return null; // layout guard redirects before this ever renders

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Ambil Nomor Antrean</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pilih poliklinik & dokter tujuan untuk mendapatkan nomor antrean hari ini.
        </p>
      </div>

      {myActiveQueue ? (
        <PatientQueueStatus myQueue={myActiveQueue} />
      ) : (
        <React.Suspense fallback={<LoadingState title="Memuat formulir antrean..." />}>
          <RegistrationForm
            cancelHref={ROUTES.PATIENT.DASHBOARD}
            continueHref={ROUTES.PATIENT.QUEUE}
            continueLabel="Lihat Status Antrean Saya"
            allowNewPatient={false}
            fixedPatient={patient}
            source="ONLINE"
            createVisitImmediately={false}
          />
        </React.Suspense>
      )}
    </div>
  );
}
