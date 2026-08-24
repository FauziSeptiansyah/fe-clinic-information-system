"use client";

import * as React from "react";
import Link from "next/link";
import { medicineService, inventoryService } from "@/services";
import { MedicineBatch, InventorySummary } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Boxes, AlertTriangle, History, ShoppingCart, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function InventoryPage() {
  const [summary, setSummary] = React.useState<InventorySummary | null>(null);
  const [batches, setBatches] = React.useState<MedicineBatch[]>([]);

  React.useEffect(() => {
    async function load() {
      const [sum, bts] = await Promise.all([
        inventoryService.getSummary(),
        medicineService.getBatches(),
      ]);
      setSummary(sum);
      setBatches(bts);
    }
    load();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Inventori & Batch FEFO"
        description="Monitoring stok obat, pelacakan tanggal kedaluwarsa First Expired First Out (FEFO), dan kartu mutasi stok."
        actions={
          <div className="flex items-center gap-2">
            <Link href={ROUTES.INVENTORY.MOVEMENTS}>
              <Button variant="outline" size="sm" className="text-xs">
                <History className="h-3.5 w-3.5 mr-1" />
                Kartu Stok (Mutasi)
              </Button>
            </Link>
            <Link href={ROUTES.PURCHASES.NEW}>
              <Button size="sm" className="font-semibold shadow-xs">
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Order Pembelian (PO)
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Katalog Obat" value={summary?.totalItems || 0} icon={Boxes} />
        <StatCard title="Stok Menipis" value={summary?.lowStockCount || 0} icon={AlertTriangle} className="border-amber-200 bg-amber-50/20" />
        <StatCard title="Stok Habis" value={summary?.outOfStockCount || 0} className="border-red-200 bg-red-50/20" />
        <StatCard title="Segera Kedaluwarsa" value={summary?.expiringSoonCount || 0} icon={Clock} />
        <StatCard title="Kedaluwarsa (Expired)" value={summary?.expiredCount || 0} className="border-red-300" />
      </div>

      <Card className="shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Daftar Batch Aktif — Urutan Pengeluaran FEFO (First Expired First Out)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Obat dengan tanggal kedaluwarsa paling dekat diprioritaskan untuk penyiapan resep.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Nama Obat</th>
                  <th className="p-3 text-left">Nomor Batch</th>
                  <th className="p-3 text-left">Tanggal Masuk</th>
                  <th className="p-3 text-left">Tanggal Expired (FEFO)</th>
                  <th className="p-3 text-left">Sisa Stok</th>
                  <th className="p-3 text-left">Status Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{b.medicineName}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                    <td className="p-3 text-slate-500">{formatDate(b.entryDate)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatDate(b.expiredDate)}</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{b.remainingQuantity}</td>
                    <td className="p-3"><StatusBadge status={b.status} type="batch" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
