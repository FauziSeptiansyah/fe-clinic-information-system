"use client";

import Link from "next/link";
import { Ticket, LogOut, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/Displays";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";

/**
 * Owns the whole right-hand auth area of the public navbar so there is exactly one
 * coherent state at a time: signed out shows "Ambil Antrian" + "Login"; signed in as a
 * patient shows just their identity (linking to their page) plus a logout icon — never
 * both a logged-out CTA and a logged-in chip at once.
 */
export function PatientNavStatus() {
  const patient = usePatientAuthStore((s) => s.patient);
  const logoutPatient = usePatientAuthStore((s) => s.logoutPatient);

  if (!patient) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Link href={ROUTES.PATIENT.QUEUE}>
          <Button size="sm" variant="outline" className="font-semibold border-blue-200 text-blue-700 hover:bg-blue-50">
            <Ticket className="h-4 w-4 mr-1.5" />
            Ambil Antrian
          </Button>
        </Link>
        <Link href={ROUTES.PUBLIC.LOGIN}>
          <Button size="sm" className="font-semibold shadow-sm">
            <LogIn className="h-4 w-4 mr-1.5" />
            Login
          </Button>
        </Link>
      </div>
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

/** Hero "already have an account?" hint — hidden once a patient is actually signed in. */
export function PatientLoginHint() {
  const patient = usePatientAuthStore((s) => s.patient);
  if (patient) return null;

  return (
    <Link href={ROUTES.PUBLIC.LOGIN} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600">
      <LogIn className="h-3.5 w-3.5" />
      Sudah punya akun? Login di sini
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
