"use client";

import * as React from "react";
import Link from "next/link";
import { inventoryService } from "@/services";
import { StockMovement } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function StockMovementsPage() {
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await inventoryService.getMovements();
        setMovements(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: "date",
      header: "Waktu Transaksi",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.getValue("date")}</span>,
    },
    {
      accessorKey: "medicineName",
      header: "Nama Obat",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("medicineName")}</span>,
    },
    {
      accessorKey: "batchNumber",
      header: "Batch",
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.getValue("batchNumber") || "-"}</span>,
    },
    {
      accessorKey: "type",
      header: "Jenis Mutasi",
      cell: ({ row }) => {
        const t = row.getValue("type") as string;
        return <Badge variant="outline" className="text-xs">{t}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Jumlah Mutasi",
      cell: ({ row }) => {
        const q = row.getValue("quantity") as number;
        return (
          <span className={`font-mono font-bold text-xs ${q > 0 ? "text-emerald-700" : "text-red-700"}`}>
            {q > 0 ? `+${q}` : q}
          </span>
        );
      },
    },
    {
      accessorKey: "referenceNumber",
      header: "No. Referensi / PO / Resep",
      cell: ({ row }) => <span className="font-mono text-xs text-blue-600">{row.getValue("referenceNumber")}</span>,
    },
    {
      accessorKey: "createdBy",
      header: "Petugas",
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.getValue("createdBy")}</span>,
    },
  ];

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.INVENTORY.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Inventori
        </Link>
      </div>

      <PageHeader
        title="Kartu Stok & Riwayat Mutasi Obat"
        description="Audit pergerakan stok obat masuk dari supplier (PO), keluar ke pasien (Resep), dan penyesuaian opname."
      />

      <DataTable
        columns={columns}
        data={movements}
        searchKey="medicineName"
        searchPlaceholder="Cari riwayat obat..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
