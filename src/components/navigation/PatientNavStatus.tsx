"use client";

import * as React from "react";
import Link from "next/link";
import { Ticket, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/Displays";
import { PatientRegisterModal } from "@/components/patient/PatientRegisterModal";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";

/**
 * Owns the whole right-hand auth area of the public navbar so there is exactly one
 * coherent state at a time: signed out shows "Ambil Antrian" (opens the registration
 * modal) + "Login"; signed in as a patient shows just their identity (linking to their
 * page) plus a logout icon — never both a logged-out CTA and a logged-in chip at once.
 */
export function PatientNavStatus() {
  const patient = usePatientAuthStore((s) => s.patient);
  const logoutPatient = usePatientAuthStore((s) => s.logoutPatient);
  const [registerOpen, setRegisterOpen] = React.useState(false);

  if (!patient) {
    return (
      <>
        <div className="hidden sm:flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setRegisterOpen(true)}
          >
            <Ticket className="h-4 w-4 mr-1.5" />
            Ambil Antrian
          </Button>
          <Link href={ROUTES.PUBLIC.LOGIN}>
            <Button size="sm" className="font-semibold shadow-sm">
              <LogIn className="h-4 w-4 mr-1.5" />
              Login
            </Button>
          </Link>
        </div>
        <PatientRegisterModal open={registerOpen} onOpenChange={setRegisterOpen} redirectTo={ROUTES.PATIENT.QUEUE} />
      </>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-1">
      <Link
        href={ROUTES.PATIENT.DASHBOARD}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <UserAvatar name={patient.fullName} size="sm" />
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900 leading-tight">{patient.fullName.split(" ")[0]}</p>
          <p className="text-[10px] text-slate-500 leading-tight">{patient.mrNumber}</p>
        </div>
      </Link>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={logoutPatient}
        className="h-8 w-8 text-slate-400 hover:text-red-600"
        title="Keluar"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
