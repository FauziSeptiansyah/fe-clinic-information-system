"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, LayoutGrid, Ticket, History, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/Displays";
import { LoadingState } from "@/components/common/LoadingState";
import { ROUTES } from "@/config/routes";
import { MOCK_CLINIC_PROFILE } from "@/mocks";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientService } from "@/services";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { href: ROUTES.PATIENT.DASHBOARD, label: "Dashboard", icon: LayoutGrid },
  { href: ROUTES.PATIENT.QUEUE, label: "Antrean", icon: Ticket },
  { href: ROUTES.PATIENT.HISTORY, label: "Riwayat", icon: History },
  { href: ROUTES.PATIENT.PROFILE, label: "Profil", icon: UserRound },
];

/**
 * Shared shell for the whole patient area (dashboard/queue/history/profile) — deliberately
 * light: just a simple header, no back-office sidebar. Also the single place that guards
 * every /patient/* route, redirecting to /login?redirect=<path> if not signed in.
 */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const patient = usePatientAuthStore((s) => s.patient);
  const logoutPatient = usePatientAuthStore((s) => s.logoutPatient);
  const [sessionChecked, setSessionChecked] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!patient) {
        router.replace(`${ROUTES.PUBLIC.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const found = await patientService.getById(patient.id);
      if (cancelled) return;
      if (!found) {
        logoutPatient();
        toast.info("Sesi Anda sudah tidak berlaku, silakan masuk kembali.");
        router.replace(`${ROUTES.PUBLIC.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      setSessionChecked(true);
    }
    verify();
    return () => {
      cancelled = true;
    };
    // Re-check only when the identity or the path changes, not on every store re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id, pathname]);

  if (!sessionChecked || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Memeriksa sesi..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={ROUTES.PATIENT.DASHBOARD} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight leading-tight hidden xs:block">
              {MOCK_CLINIC_PROFILE.name}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <UserAvatar name={patient.fullName} size="sm" />
              <span className="text-xs font-bold text-slate-900 hidden sm:block">{patient.fullName.split(" ")[0]}</span>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                logoutPatient();
                router.push(ROUTES.PUBLIC.HOME);
              }}
              className="h-8 w-8 text-slate-400 hover:text-red-600"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-2 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors",
                  isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">{children}</main>
    </div>
  );
}
