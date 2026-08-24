"use client";

import * as React from "react";
import { reportService } from "@/services";
import { PatientReportData } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function PatientReportsPage() {
  const [data, setData] = React.useState<PatientReportData | null>(null);
  const [, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await reportService.getPatientReport();
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
          title="Laporan Demografi & Kunjungan Pasien"
          description="Statistik tren pendaftaran pasien baru, distribusi usia, gender, dan jenis penjamin."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Pasien Terdaftar" value={data?.totalPatients || 0} icon={Users} />
        <StatCard title="Pasien Baru Bulan Ini" value={data?.newPatientsThisMonth || 0} icon={UserPlus} />
        <StatCard title="Pasien Aktif Berkunjung" value={data?.activePatientsThisMonth || 0} icon={UserCheck} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Distribusi Penjamin Pasien</CardTitle>
            <CardDescription className="text-xs text-slate-500">Persentase pasien berdasarkan skema pembayaran.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.byPayer || []}
                  dataKey="count"
                  nameKey="payer"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: { name?: string; percent?: number }) => `${entry.name || ""} ${entry.percent ? (entry.percent * 100).toFixed(0) : 0}%`}
                >
                  {(data?.byPayer || []).map((entry, index: number) => (
                    <Cell key={`cell-${entry.payer || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Distribusi Kelompok Usia Pasien</CardTitle>
            <CardDescription className="text-xs text-slate-500">Rentang usia populasi pasien klinik.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byAgeGroup || []}>
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Jumlah Pasien" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
