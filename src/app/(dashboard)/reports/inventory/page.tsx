"use client";

import * as React from "react";
import { reportService, inventoryService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, AlertTriangle, Clock, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { InventoryReportData, InventorySummary } from "@/types";

export default function InventoryReportsPage() {
  const [data, setData] = React.useState<InventoryReportData | null>(null);
  const [summary, setSummary] = React.useState<InventorySummary | null>(null);

  React.useEffect(() => {
    async function load() {
      const [r, s] = await Promise.all([
        reportService.getInventoryReport(),
        inventoryService.getSummary(),
      ]);
      setData(r);
      setSummary(s);
    }
    load();
  }, []);

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <PageHeader
          title="Laporan Valuasi & Perputaran Stok Obat"
          description="Nilai aset inventori farmasi, monitoring obat kedaluwarsa, dan status persediaan gudang."
        />
        <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Valuasi Nilai Stok" value={formatCurrency(data?.totalValuation || 0)} icon={Boxes} />
        <StatCard title="Katalog Obat" value={summary?.totalItems || 0} />
        <StatCard title="Stok Kritis / Menipis" value={summary?.lowStockCount || 0} icon={AlertTriangle} />
        <StatCard title="Batch Expired / Kritis" value={summary?.expiredCount || 0} icon={Clock} className="border-red-200" />
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900">Valuasi Stok per Kategori Obat</CardTitle>
          <CardDescription className="text-xs text-slate-500">Nilai aset obat berdasarkan kelompok terapi.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.valuationByCategory || []}>
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [formatCurrency(Number(val)), "Nilai Stok"]} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Nilai Stok" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
