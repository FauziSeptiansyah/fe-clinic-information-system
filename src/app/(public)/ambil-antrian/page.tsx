"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ArrowLeft, Ticket, LogIn, UserPlus, LogOut } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { RegistrationForm } from "@/features/registrations/RegistrationForm";
import { UserAvatar, DetailCard, DetailRow } from "@/components/common/Displays";
import { PatientQueueStatus } from "@/components/queue/PatientQueueStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { MOCK_CLINIC_PROFILE } from "@/mocks";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientService, queueService } from "@/services";
import { useQueueStore } from "@/stores/queueStore";
import { Queue } from "@/types";
import { toast } from "sonner";

const ACTIVE_STATUSES = new Set(["WAITING", "CALLED", "IN_SERVICE"]);

export default function SelfServiceQueuePage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const logoutPatient = usePatientAuthStore((s) => s.logoutPatient);
  const [sessionChecked, setSessionChecked] = React.useState(false);

  const setQueues = useQueueStore((s) => s.setQueues);
  const queues = useQueueStore((s) => s.queues);
  const myActiveQueue: Queue | undefined = patient
    ? queues.find((q) => q.patientId === patient.id && ACTIVE_STATUSES.has(q.status))
    : undefined;

  React.useEffect(() => {
    let cancelled = false;
    async function verifySession() {
      if (patient) {
        const found = await patientService.getById(patient.id);
        if (cancelled) return;
        if (!found) {
          logoutPatient();
          toast.info("Sesi Anda sudah tidak berlaku, silakan masuk kembali.");
        }
      }
      if (!cancelled) setSessionChecked(true);
    }
    verifySession();
    return () => {
      cancelled = true;
    };
    // Only re-check when the logged-in patient identity changes, not on every store re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id]);

  React.useEffect(() => {
    if (!patient) return;
    queueService.getAll().then(setQueues);
  }, [patient, setQueues]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight leading-tight block">
                {MOCK_CLINIC_PROFILE.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none block">
                Ambil Nomor Antrian Online
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {patient && (
              <Button type="button" variant="ghost" size="sm" onClick={logoutPatient} className="text-xs text-slate-500 hover:text-red-600">
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Keluar
              </Button>
            )}
            <Link href={ROUTES.PUBLIC.HOME} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-3">
            <Ticket className="h-3.5 w-3.5" />
            Layanan Mandiri
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ambil Nomor Antrian Online
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Masuk atau daftar sebagai pasien, pilih poliklinik & dokter tujuan, lalu dapatkan nomor antrian —
            tanpa perlu mengantre lagi di loket pendaftaran. Nomor Anda akan tampil di layar TV & dipanggil saat giliran tiba.
          </p>
        </div>

        {!sessionChecked ? (
          <LoadingState title="Memeriksa sesi..." />
        ) : patient ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <UserAvatar name={patient.fullName} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Masuk sebagai {patient.fullName}</p>
                    <p className="text-xs text-slate-600">No RM: <span className="font-mono font-semibold">{patient.mrNumber}</span></p>
                  </div>
                </CardContent>
              </Card>

              <DetailCard title="Data Diri Anda" description="Data yang tersimpan di rekam medis Anda.">
                <DetailRow label="Nama Lengkap" value={patient.fullName} />
                <DetailRow label="NIK" value={patient.nik} />
                <DetailRow label="Tanggal Lahir" value={patient.birthDate} />
                <DetailRow label="Nomor HP" value={patient.phone} />
                <DetailRow label="Email" value={patient.email || "-"} />
                <DetailRow label="Alamat" value={patient.address} />
                <DetailRow label="Penjamin" value={patient.payer} />
              </DetailCard>

              {!myActiveQueue && (
                <React.Suspense fallback={<LoadingState title="Memuat formulir antrian..." />}>
                  <RegistrationForm
                    cancelHref={ROUTES.PUBLIC.HOME}
                    continueHref={ROUTES.QUEUES.DISPLAY}
                    continueLabel="Lihat Layar Antrian"
                    allowNewPatient={false}
                    fixedPatient={patient}
                  />
                </React.Suspense>
              )}
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-24">
              {myActiveQueue ? (
                <PatientQueueStatus myQueue={myActiveQueue} />
              ) : (
                <Card className="border-dashed border-slate-300 bg-slate-50/60">
                  <CardContent className="p-5 text-center text-xs text-slate-500">
                    Belum ada nomor antrian aktif hari ini. Lengkapi formulir di samping untuk mengambil nomor.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="max-w-xl">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Untuk mengambil nomor antrian, silakan login dengan akun Anda, atau daftar terlebih dahulu jika
                ini kunjungan pertama Anda.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href={ROUTES.PUBLIC.LOGIN}>
                  <Button type="button" className="w-full font-semibold shadow-xs">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Login
                  </Button>
                </Link>
                <Link href={ROUTES.PUBLIC.PATIENT_REGISTER}>
                  <Button type="button" variant="outline" className="w-full font-semibold">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Daftar Pasien Baru
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
