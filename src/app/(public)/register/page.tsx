import * as React from "react";
import Link from "next/link";
import { Building2, ArrowLeft, UserPlus } from "lucide-react";
import { PatientSelfRegisterForm } from "@/features/registrations/PatientSelfRegisterForm";
import { LoadingState } from "@/components/common/LoadingState";
import { ROUTES } from "@/config/routes";
import { MOCK_CLINIC_PROFILE } from "@/mocks";

export default function PatientRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight leading-tight block">
              {MOCK_CLINIC_PROFILE.name}
            </span>
          </Link>
          <Link href={ROUTES.PUBLIC.HOME} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-3">
            <UserPlus className="h-3.5 w-3.5" />
            Daftar Akun Pasien
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Buat Akun Pasien
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Cukup beberapa detik. Setelah ini Anda langsung masuk dan bisa mengambil nomor antrean.
          </p>
        </div>

        <React.Suspense fallback={<LoadingState title="Memuat formulir..." />}>
          <PatientSelfRegisterForm />
        </React.Suspense>
      </main>
    </div>
  );
}
