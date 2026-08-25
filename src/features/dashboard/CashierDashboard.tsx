"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Receipt, Wallet, AlertCircle, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WelcomeBanner } from "./WelcomeBanner";
import { QuickActionsCard } from "./QuickActions";
import { billingService, paymentService, visitService } from "@/services";
import { ROUTES } from "@/config/routes";
import { Invoice, Payment, User, Visit } from "@/types";

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function CashierDashboard({ user }: { user: User | null }) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([billingService.getAll(), paymentService.getAll(), visitService.getAll()]).then(([inv, pays, vs]) => {
      if (cancelled) return;
      setInvoices(inv);
      setPayments(pays);
      setVisits(vs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only invoices whose visit has actually reached the cashier stage are "ready to bill" —
  // a visit still with the nurse or pharmacy isn't payable yet even if its invoice is unpaid.
  const visitsWaitingCashier = new Set(visits.filter((v) => v.status === "WAITING_CASHIER").map((v) => v.id));
  const unpaid = invoices.filter(
    (i) => (i.status === "UNPAID" || i.status === "PARTIAL") && i.visitId && visitsWaitingCashier.has(i.visitId)
  );
  const receivable = unpaid.reduce((sum, i) => sum + i.remainingAmount, 0);
  const revenueToday = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <WelcomeBanner
        userName={user?.name || "Kasir"}
        role="CASHIER"
        subtitle="Kasir & Penerimaan Pembayaran"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tagihan Belum Lunas" value={unpaid.length} description="Perlu pembayaran / cicilan" icon={AlertCircle} />
        <StatCard title="Piutang Berjalan" value={formatIDR(receivable)} description="Total sisa tagihan pasien" icon={Receipt} />
        <StatCard title="Pendapatan Hari Ini" value={formatIDR(revenueToday)} description="Penerimaan tunai, QRIS & asuransi" icon={Wallet} />
        <StatCard title="Transaksi Hari Ini" value={payments.length} description="Jumlah pembayaran diproses" icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                Tagihan Belum Lunas
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Invoice yang perlu ditagihkan ke pasien</CardDescription>
            </div>
            <Link href={ROUTES.BILLING.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Semua Tagihan <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {unpaid.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Semua tagihan sudah lunas.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unpaid.slice(0, 6).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        {inv.patientName}
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {inv.invoiceNumber}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">Sisa: {formatIDR(inv.remainingAmount)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inv.status} type="invoice" />
                      <Link href={ROUTES.BILLING.DETAIL(inv.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Bayar</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <QuickActionsCard
          title="Aksi Cepat Kasir"
          actions={[
            { label: "Tagihan / Billing", href: ROUTES.BILLING.LIST, icon: Receipt, iconClassName: "text-blue-600" },
            { label: "Pembayaran Kasir", href: ROUTES.PAYMENTS, icon: CreditCard, iconClassName: "text-emerald-600" },
          ]}
        />
      </div>
    </>
  );
}
