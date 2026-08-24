import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403 — Akses Ditolak</h1>
      <p className="max-w-md text-sm text-slate-500 mt-2 mb-6">
        Anda tidak memiliki hak izin (permission) yang cukup untuk mengakses halaman ini. Silakan hubungi Administrator Klinik.
      </p>
      <Link href={ROUTES.DASHBOARD}>
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
}
