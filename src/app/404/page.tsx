"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { usePatientAuthStore } from "@/stores/patientAuthStore";

export default function NotFoundPage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const backHref = patient ? ROUTES.PUBLIC.TAKE_QUEUE : ROUTES.DASHBOARD;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Halaman Tidak Ditemukan</h1>
      <p className="max-w-md text-sm text-slate-500 mt-2 mb-6">
        Halaman atau berkas yang Anda cari tidak tersedia atau tautan telah dipindahkan.
      </p>
      <Link href={backHref}>
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {patient ? "Kembali ke Antrian Saya" : "Kembali ke Dashboard"}
        </Button>
      </Link>
    </div>
  );
}
