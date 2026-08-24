"use client";

import * as React from "react";
import { reportService } from "@/services";
import { VisitReportData } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Stethoscope, CheckCircle, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function VisitReportsPage() {
  const [data, setData] = React.useState<VisitReportData | null>(null);
  const [, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await reportService.getVisitReport();
        setData(res);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <PageHeader
          title="Laporan Kunjungan & Pelayanan Poliklinik"
          description="Analisis volume kunjungan rawat jalan, beban kerja poliklinik, dan performa penanganan dokter."
        />
        <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Kunjungan" value={data?.totalVisits || 0} icon={Activity} />
        <StatCard title="Selesai Diperiksa" value={data?.completedVisits || 0} icon={CheckCircle} />
        <StatCard title="Rata-rata Kunjungan / Hari" value={data?.averagePerDay || 0} icon={Stethoscope} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Kunjungan per Poliklinik</CardTitle>
            <CardDescription className="text-xs text-slate-500">Jumlah pasien yang dilayani di tiap departemen.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDepartment || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Kunjungan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Beban Pemeriksaan Dokter</CardTitle>
            <CardDescription className="text-xs text-slate-500">Jumlah pasien yang ditangani tiap dokter.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDoctor || []}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Pasien Diperiksa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
