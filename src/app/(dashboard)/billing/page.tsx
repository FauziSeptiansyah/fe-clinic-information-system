"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Invoice } from "@/types";
import { billingService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Eye, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await billingService.getAll();
        setInvoices(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "No. Tagihan",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
          {row.getValue("invoiceNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div>
            <span className="font-semibold text-xs text-slate-900">{inv.patientName}</span>
            <p className="text-[11px] text-slate-500 font-mono">{inv.patientMrNumber}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "payerType",
      header: "Penjamin",
      cell: ({ row }) => {
        const p = row.original.payerType;
        const cfg = PAYER_CONFIG[p] || { label: p, badgeVariant: "outline" as const };
        return <Badge variant={cfg.badgeVariant} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "grandTotal",
      header: "Total Tagihan",
      cell: ({ row }) => <span className="font-bold text-xs text-slate-900">{formatCurrency(row.getValue("grandTotal"))}</span>,
    },
    {
      accessorKey: "remainingAmount",
      header: "Sisa Tagihan",
      cell: ({ row }) => {
        const rem = row.getValue("remainingAmount") as number;
        return (
          <span className={`font-mono font-bold text-xs ${rem > 0 ? "text-red-700" : "text-emerald-700"}`}>
            {formatCurrency(rem)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status Pembayaran",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="invoice" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.BILLING.DETAIL(inv.id)}>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Eye className="h-3.5 w-3.5 mr-1" />
                Rincian
              </Button>
            </Link>
            {inv.status !== "PAID" && (
              <Link href={ROUTES.PAYMENTS}>
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 font-semibold">
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Bayar
                </Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Billing & Tagihan Pasien"
        description="Faktur tagihan kunjungan, layanan konsultasi, tindakan medis, dan obat farmasi."
        actions={
          <Link href={ROUTES.PAYMENTS}>
            <Button size="sm" className="font-semibold shadow-xs">
              <CreditCard className="h-4 w-4 mr-1.5" />
              Kasir Pembayaran
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="patientName"
        searchPlaceholder="Cari tagihan pasien..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
