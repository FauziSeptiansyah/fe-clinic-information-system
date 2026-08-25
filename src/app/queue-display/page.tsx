"use client";

import * as React from "react";
import Link from "next/link";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft, Clock, Activity, BellRing } from "lucide-react";
import { MOCK_CLINIC_PROFILE } from "@/mocks";
import { UserAvatar } from "@/components/common/Displays";
import { useQueueTimeoutWatcher } from "@/hooks/useQueueTimeoutWatcher";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { ROUTES } from "@/config/routes";

export default function QueueDisplayTVPage() {
  const { queues, setQueues } = useQueueStore();
  const [currentTime, setCurrentTime] = React.useState("");
  const patient = usePatientAuthStore((s) => s.patient);
  // A patient came here from their own page — send them back there, not into the staff dashboard.
  const backHref = patient ? ROUTES.PATIENT.DASHBOARD : ROUTES.DASHBOARD;
  useQueueTimeoutWatcher();

  React.useEffect(() => {
    let mounted = true;
    queueService.getAll().then((list) => {
      if (mounted) setQueues(list);
    });

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [setQueues]);

  const currentCalled = queues.find((q) => q.status === "CALLED" || q.status === "IN_SERVICE") || null;
  const waitingList = queues.filter((q) => q.status === "WAITING");
  const inServiceList = queues.filter((q) => q.status === "IN_SERVICE");

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,#1e3a8a_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black_20%,transparent_75%)]"
      />
      <div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Top TV Header */}
      <header className="relative flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">{MOCK_CLINIC_PROFILE.name}</h1>
            <p className="text-xs text-blue-400 font-medium">Layar Pemanggilan Antrian Poliklinik Terpadu</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="font-mono text-base font-bold text-white tracking-widest">{currentTime || "08:00:00"}</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 animate-pulse">
            SISTEM LIVE
          </Badge>
        </div>
      </header>

      {/* Main Display Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6">
        {/* Left: Giant Currently Called Queue */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 p-8 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <BellRing className="h-3.5 w-3.5 animate-bounce" />
              PANGGILAN AKTIF
            </div>

            <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-blue-300">
              NOMOR ANTRIAN SAAT INI
            </p>

            <div className="my-6">
              <span className="text-7xl sm:text-9xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
                {currentCalled ? currentCalled.queueNumber : "---"}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                {currentCalled ? currentCalled.departmentName : "Menunggu Antrian Berikutnya"}
              </h3>
              <p className="text-base text-slate-300 font-medium">
                {currentCalled ? `Dokter: ${currentCalled.doctorName}` : "-"}
              </p>
              <p className="text-sm text-slate-400">
                {currentCalled ? `Pasien: ${currentCalled.patientName}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Department Overview & Next Queues */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sedang Diperiksa di Ruangan</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {inServiceList.slice(0, 4).map((q) => (
                <div key={q.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{q.departmentName}</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{q.queueNumber}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 truncate max-w-[80px]">{q.patientName.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Antrian Berikutnya (Menunggu)</span>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                {waitingList.length} Pasien
              </Badge>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {waitingList.slice(0, 5).map((q) => (
                <div key={q.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-amber-400 text-sm bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
                      {q.queueNumber}
                    </span>
                    <UserAvatar name={q.patientName} size="sm" className="ring-slate-700 shrink-0" />
                    <span className="font-medium text-slate-200 truncate">{q.patientName}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0">{q.departmentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TV Running Text Footer */}
      <footer className="relative pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Info: Mohon persiapkan KTP / Kartu BPJS saat nomor dipanggil ke ruangan periksa.</span>
        </div>
        <span>{MOCK_CLINIC_PROFILE.city} • Pelayanan Medis Paripurna</span>
      </footer>
    </div>
  );
}
