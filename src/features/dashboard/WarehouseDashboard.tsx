"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, Package, ShoppingCart, Truck, AlertTriangle, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { inventoryService, medicineService, purchaseService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Medicine, Purchase, InventorySummary, User } from "@/types";

export function WarehouseDashboard({ user }: { user: User | null }) {
  const [summary, setSummary] = React.useState<InventorySummary | null>(null);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([inventoryService.getSummary(), medicineService.getAll(), purchaseService.getAll()]).then(
      ([sum, meds, po]) => {
        if (cancelled) return;
        setSummary(sum);
        setMedicines(meds);
        setPurchases(po);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const lowStockMeds = medicines.filter((m) => m.currentStock <= m.minimumStock);
  const pendingPO = purchases.filter((p) => p.status === "PENDING");

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Gudang Farmasi"}
        role="WAREHOUSE"
        subtitle="Inventori, Stok & Pembelian Obat"
        actions={
          <Link href={ROUTES.PURCHASES.NEW}>
            <Button size="sm" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs shadow-xs">
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Buat Pembelian (PO)
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Item Obat" value={summary?.totalItems ?? 0} description="Katalog obat aktif" icon={Package} />
        <StatCard title="Stok Menipis" value={summary?.lowStockCount ?? 0} description="Di bawah batas minimum" icon={AlertTriangle} />
        <StatCard title="Stok Habis" value={summary?.outOfStockCount ?? 0} description="Perlu pembelian segera" icon={Boxes} />
        <StatCard title="Kadaluarsa / Segera" value={(summary?.expiredCount ?? 0) + (summary?.expiringSoonCount ?? 0)} description="Batch perlu ditindaklanjuti" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Stok Obat Menipis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Obat yang perlu segera dipesan ulang</CardDescription>
            </div>
            <Link href={ROUTES.INVENTORY.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Kelola Stok <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockMeds.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Seluruh stok obat berada dalam batas aman.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockMeds.slice(0, 6).map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{med.name}</p>
                      <p className="text-xs text-red-600 font-medium">Sisa: {med.currentStock} {med.unit} (Min: {med.minimumStock})</p>
                    </div>
                    <Link href={ROUTES.PURCHASES.NEW}>
                      <Button size="sm" variant="outline" className="text-xs h-8">Order PO</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                Pembelian Menunggu Diterima
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-2.5">
              {pendingPO.length === 0 ? (
                <p className="text-xs text-slate-500">Tidak ada purchase order yang menunggu.</p>
              ) : (
                pendingPO.slice(0, 3).map((po) => (
                  <div key={po.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{po.purchaseNumber}</p>
                      <p className="text-[11px] text-slate-500 truncate">{po.supplierName}</p>
                    </div>
                    <StatusBadge status={po.status} type="purchase" className="text-[10px] shrink-0" />
                  </div>
                ))
              )}
              <Link href={ROUTES.PURCHASES.LIST} className="block pt-1 text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">Lihat Semua Pembelian →</span>
              </Link>
            </CardContent>
          </Card>

          <QuickActionsCard
            title="Aksi Cepat Gudang"
            actions={[
              { label: "Katalog Obat", href: ROUTES.MEDICINES.LIST, icon: Package, iconClassName: "text-blue-600" },
              { label: "Stok & Batch (FEFO)", href: ROUTES.INVENTORY.LIST, icon: Boxes, iconClassName: "text-emerald-600" },
              { label: "Pembelian (PO)", href: ROUTES.PURCHASES.LIST, icon: ShoppingCart, iconClassName: "text-violet-600" },
              { label: "Supplier Obat", href: ROUTES.SUPPLIERS, icon: Truck, iconClassName: "text-amber-600" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
