import Link from "next/link";
import { KioskQueueForm } from "@/features/queue/KioskQueueForm";
import { Building2, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { MOCK_CLINIC_PROFILE } from "@/mocks";

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{MOCK_CLINIC_PROFILE.name}</p>
            <p className="text-[11px] text-slate-500">Mesin Antrean Mandiri</p>
          </div>
        </div>
        <Link href={ROUTES.PUBLIC.HOME} className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 pb-16">
        <div className="w-full max-w-md">
          <KioskQueueForm />
        </div>
      </main>
    </div>
  );
}
