"use client";

import * as React from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientRegisterModal } from "@/components/patient/PatientRegisterModal";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";

/** The landing page's primary CTA: already a patient → straight to the queue page; not signed in yet → opens the registration modal right here. */
export function HeroTakeQueueButton() {
  const patient = usePatientAuthStore((s) => s.patient);
  const [registerOpen, setRegisterOpen] = React.useState(false);

  if (patient) {
    return (
      <Link href={ROUTES.PATIENT.QUEUE}>
        <Button size="lg" className="h-12 px-7 shadow-lg shadow-blue-600/20 font-semibold text-sm">
          <Ticket className="h-4 w-4 mr-2" />
          Ambil Nomor Antrian Online
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="h-12 px-7 shadow-lg shadow-blue-600/20 font-semibold text-sm"
        onClick={() => setRegisterOpen(true)}
      >
        <Ticket className="h-4 w-4 mr-2" />
        Ambil Nomor Antrian Online
      </Button>
      <PatientRegisterModal open={registerOpen} onOpenChange={setRegisterOpen} redirectTo={ROUTES.PATIENT.QUEUE} />
    </>
  );
}
