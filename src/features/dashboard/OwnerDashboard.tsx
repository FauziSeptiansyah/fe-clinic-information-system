"use client";

import * as React from "react";
import { TrendingUp, Users, Calendar, Receipt, BarChart3, Building2, PieChart } from "lucide-react";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { reportService } from "@/services";
import { ROUTES } from "@/config/routes";
import { User, RevenueReportData, VisitReportData } from "@/types";

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function OwnerDashboard({ user }: { user: User | null }) {
  const [stats, setStats] = React.useState({ totalPatients: 0, todayVisits: 0, activeQueues: 0, todayRevenue: 0 });
  const [revenue, setRevenue] = React.useState<RevenueReportData | null>(null);
  const [visitReport, setVisitReport] = React.useState<VisitReportData | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      reportService.getDashboardStats(),
      reportService.getRevenueReport(),
      reportService.getVisitReport(),
    ]).then(([s, r, v]) => {
      if (cancelled) return;
      setStats(s);
      setRevenue(r);
      setVisitReport(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxByDept = visitReport ? Math.max(1, ...visitReport.byDepartment.map((d) => d.count)) : 1;
  const maxByMethod = revenue ? Math.max(1, ...revenue.byPaymentMethod.map((m) => m.amount)) : 1;

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Owner"}
        role="OWNER"
        subtitle="Ringkasan Bisnis Klinik Pratama Sehat Bersama"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pendapatan" value={formatIDR(revenue?.totalRevenue || 0)} description="Nilai seluruh tagihan" icon={TrendingUp} />
        <StatCard title="Sudah Dibayar" value={formatIDR(revenue?.totalPaid || 0)} description="Penerimaan kas terkumpul" icon={Receipt} />
        <StatCard title="Piutang Berjalan" value={formatIDR(revenue?.totalReceivable || 0)} description="Tagihan belum lunas" icon={PieChart} />
        <StatCard title="Total Kunjungan" value={stats.todayVisits} description={`${stats.totalPatients} pasien terdaftar`} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Pendapatan per Metode Pembayaran
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Distribusi penerimaan berdasarkan cara bayar</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {revenue?.byPaymentMethod.map((m) => (
              <div key={m.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{m.method}</span>
                  <span className="font-semibold text-slate-900">{formatIDR(m.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(m.amount / maxByMethod) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Kunjungan per Poli
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5">
              {visitReport?.byDepartment.map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-semibold text-slate-900">{d.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d.count / maxByDept) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <QuickActionsCard
            title="Laporan & Analitik"
            actions={[
              { label: "Laporan Pendapatan", href: ROUTES.REPORTS.REVENUE, icon: TrendingUp, iconClassName: "text-emerald-600" },
              { label: "Laporan Kunjungan", href: ROUTES.REPORTS.VISITS, icon: Calendar, iconClassName: "text-blue-600" },
              { label: "Laporan Pasien", href: ROUTES.REPORTS.PATIENTS, icon: Users, iconClassName: "text-violet-600" },
              { label: "Laporan Farmasi & Inventori", href: ROUTES.REPORTS.PHARMACY, icon: BarChart3, iconClassName: "text-amber-600" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
