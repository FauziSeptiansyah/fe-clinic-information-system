"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Purchase } from "@/types";
import { purchaseService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function PurchasesPage() {
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await purchaseService.getAll();
        setPurchases(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Purchase>[] = [
    {
      accessorKey: "purchaseNumber",
      header: "No. Pembelian (PO)",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("purchaseNumber")}
        </span>
      ),
    },
    {
      accessorKey: "supplierName",
      header: "Distributor / Supplier",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("supplierName")}</span>,
    },
    {
      accessorKey: "purchaseDate",
      header: "Tanggal Faktur",
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDate(row.getValue("purchaseDate"))}</span>,
    },
    {
      accessorKey: "items",
      header: "Jumlah Item",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.items.length} Macam Obat</span>,
    },
    {
      accessorKey: "grandTotal",
      header: "Total Biaya",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{formatCurrency(row.getValue("grandTotal"))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="purchase" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Link href={ROUTES.PURCHASES.DETAIL(row.original.id)}>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Detail PO
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Faktur Pembelian Obat (Purchase Order)"
        description="Pencatatan pengadaan obat dari distributor, nomor batch, dan pembaruan stok otomatis."
        actions={
          <Link href={ROUTES.PURCHASES.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Buat PO / Penerimaan Obat
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={purchases}
        searchKey="supplierName"
        searchPlaceholder="Cari nama distributor..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
