"use client";

import * as React from "react";
import Link from "next/link";
import { Ticket, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/Displays";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";

/** Reflects the logged-in-patient session in the public navbar. Isolated as a client component so the landing page itself can stay a server component. */
export function PatientNavStatus() {
  const patient = usePatientAuthStore((s) => s.patient);
  const logoutPatient = usePatientAuthStore((s) => s.logoutPatient);

  if (!patient) {
    return (
      <Link href={ROUTES.PUBLIC.TAKE_QUEUE} className="hidden sm:block">
        <Button size="sm" variant="outline" className="font-semibold border-blue-200 text-blue-700 hover:bg-blue-50">
          <Ticket className="h-4 w-4 mr-1.5" />
          Ambil Antrian
        </Button>
      </Link>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-2">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
        <UserAvatar name={patient.fullName} size="sm" />
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900 leading-tight">{patient.fullName.split(" ")[0]}</p>
          <p className="text-[10px] text-slate-500 leading-tight">{patient.mrNumber}</p>
        </div>
      </div>
      <Link href={ROUTES.PUBLIC.TAKE_QUEUE}>
        <Button size="sm" className="font-semibold shadow-sm">
          <Ticket className="h-4 w-4 mr-1.5" />
          Ambil Antrian
        </Button>
      </Link>
      <Button type="button" size="sm" variant="ghost" onClick={logoutPatient} className="text-slate-400 hover:text-red-600" title="Keluar">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
