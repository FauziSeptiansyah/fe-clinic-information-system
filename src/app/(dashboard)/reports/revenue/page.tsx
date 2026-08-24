"use client";

import * as React from "react";
import { reportService } from "@/services";
import { RevenueReportData } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, TrendingUp, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"];

export default function RevenueReportsPage() {
  const [data, setData] = React.useState<RevenueReportData | null>(null);
  const [, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await reportService.getRevenueReport();
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
          title="Laporan Pendapatan & Keuangan Klinik"
          description="Rekapitulasi total omzet layanan medis, penerimaan kasir, piutang, dan distribusi metode pembayaran."
        />
        <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Pendapatan (Billed)" value={formatCurrency(data?.totalRevenue || 0)} icon={DollarSign} />
        <StatCard title="Kas Diterima (Paid)" value={formatCurrency(data?.totalPaid || 0)} icon={CreditCard} />
        <StatCard title="Sisa Piutang (Unpaid)" value={formatCurrency(data?.totalReceivable || 0)} icon={TrendingUp} className="border-red-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Distribusi Metode Pembayaran</CardTitle>
            <CardDescription className="text-xs text-slate-500">Penerimaan kas berdasarkan QRIS, Tunai, BPJS, Debit.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.byPaymentMethod || []}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }: { name?: string }) => name || ""}
                >
                  {(data?.byPaymentMethod || []).map((entry, index: number) => (
                    <Cell key={`cell-${entry.method || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number | string | readonly (string | number)[] | undefined) => formatCurrency(Number(val || 0))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Tren Pendapatan Harian</CardTitle>
            <CardDescription className="text-xs text-slate-500">Pergerakan arus kas masuk mingguan.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyRevenue || []}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number | string | readonly (string | number)[] | undefined) => formatCurrency(Number(val || 0))} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Pendapatan" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
