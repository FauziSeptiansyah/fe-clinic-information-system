"use client";

import * as React from "react";
import { reportService } from "@/services";
import { PharmacyReportData } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, CheckCircle, Clock, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function PharmacyReportsPage() {
  const [data, setData] = React.useState<PharmacyReportData | null>(null);

  React.useEffect(() => {
    async function load() {
      const res = await reportService.getPharmacyReport();
      setData(res);
    }
    load();
  }, []);

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <PageHeader
          title="Laporan Penjualan & Pelayanan Farmasi"
          description="Statistik resep obat terlayani, obat paling banyak diresepkan (fast-moving), dan kepatuhan dispensing."
        />
        <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Resep Masuk" value={data?.totalPrescriptions || 0} icon={Pill} />
        <StatCard title="Resep Selesai Dispensed" value={data?.completedPrescriptions || 0} icon={CheckCircle} />
        <StatCard title="Rata-rata Waktu Layanan" value="8 Menit" icon={Clock} />
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900">10 Obat Paling Sering Diresepkan (Fast-Moving)</CardTitle>
          <CardDescription className="text-xs text-slate-500">Volume obat keluar tertinggi dari loket apotek.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.topMedicines || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Jumlah Butir/Botol" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
