"use client";

import * as React from "react";
import Link from "next/link";
import { Pill, FileText, Package, Boxes, AlertTriangle, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { prescriptionService, inventoryService, medicineService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Prescription, Medicine, InventorySummary, User } from "@/types";

export function PharmacistDashboard({ user }: { user: User | null }) {
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [summary, setSummary] = React.useState<InventorySummary | null>(null);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([prescriptionService.getAll(), inventoryService.getSummary(), medicineService.getAll()]).then(
      ([rx, sum, meds]) => {
        if (cancelled) return;
        setPrescriptions(rx);
        setSummary(sum);
        setMedicines(meds);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const pending = prescriptions.filter((p) => p.status === "PENDING" || p.status === "PROCESSING");
  const lowStockMeds = medicines.filter((m) => m.currentStock <= m.minimumStock);

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Apoteker"}
        role="PHARMACIST"
        subtitle="Farmasi & Dispensing Obat"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Resep Menunggu" value={pending.length} description="Belum selesai diproses" icon={FileText} />
        <StatCard title="Total Item Obat" value={summary?.totalItems ?? 0} description="Katalog obat aktif" icon={Package} />
        <StatCard title="Stok Menipis" value={summary?.lowStockCount ?? 0} description="Di bawah batas minimum" icon={AlertTriangle} />
        <StatCard title="Stok Habis / Kadaluarsa" value={(summary?.outOfStockCount ?? 0) + (summary?.expiredCount ?? 0)} description="Perlu tindakan segera" icon={Boxes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-600" />
                Resep Menunggu Diproses
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Resep elektronik dari dokter yang perlu didispensing</CardDescription>
            </div>
            <Link href={ROUTES.PRESCRIPTIONS.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Semua Resep <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {pending.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Tidak ada resep yang menunggu diproses.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.slice(0, 6).map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        {rx.patientName}
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {rx.prescriptionNumber}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">{rx.doctorName} • {rx.items.length} item obat</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rx.status} type="prescription" />
                      <Link href={ROUTES.PRESCRIPTIONS.DETAIL(rx.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Proses</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xs border-amber-200 bg-amber-50/20">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Stok Obat Menipis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              {lowStockMeds.length === 0 ? (
                <p className="text-xs text-slate-500">Seluruh stok obat berada dalam batas aman.</p>
              ) : (
                lowStockMeds.slice(0, 3).map((med) => (
                  <div key={med.id} className="flex items-center justify-between bg-white p-2.5 rounded border border-amber-200 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-red-600 font-medium">Sisa: {med.currentStock} {med.unit} (Min: {med.minimumStock})</p>
                    </div>
                  </div>
                ))
              )}
              <Link href={ROUTES.INVENTORY.LIST} className="block pt-1 text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">Kelola Stok & Batch (FEFO) →</span>
              </Link>
            </CardContent>
          </Card>

          <QuickActionsCard
            title="Aksi Cepat Farmasi"
            actions={[
              { label: "Dispensing Farmasi", href: ROUTES.PHARMACY, icon: Pill, iconClassName: "text-blue-600" },
              { label: "Resep Elektronik", href: ROUTES.PRESCRIPTIONS.LIST, icon: FileText, iconClassName: "text-emerald-600" },
              { label: "Katalog Obat", href: ROUTES.MEDICINES.LIST, icon: Package, iconClassName: "text-violet-600" },
              { label: "Stok & Batch (FEFO)", href: ROUTES.INVENTORY.LIST, icon: Boxes, iconClassName: "text-amber-600" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
