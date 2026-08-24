"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Medicine } from "@/types";
import { medicineService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus, Eye, Edit, AlertTriangle, Boxes } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function MedicinesPage() {
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await medicineService.getAll();
        setMedicines(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Medicine>[] = [
    {
      accessorKey: "code",
      header: "Kode Obat",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nama Obat & Generik",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div>
            <Link href={ROUTES.MEDICINES.DETAIL(m.id)} className="font-semibold text-slate-900 hover:text-blue-600">
              {m.name}
            </Link>
            <p className="text-xs text-slate-500">{m.genericName} • {m.manufacturer}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "currentStock",
      header: "Sisa Stok",
      cell: ({ row }) => {
        const m = row.original;
        const isLow = m.currentStock <= m.minimumStock;
        const isOut = m.currentStock === 0;

        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-mono font-bold text-xs ${isOut ? "text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200" : isLow ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" : "text-emerald-700"}`}>
              {m.currentStock} {m.unit}
            </span>
            {isLow && !isOut && <span title="Stok menipis"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /></span>}
          </div>
        );
      },
    },
    {
      accessorKey: "sellingPrice",
      header: "Harga Jual",
      cell: ({ row }) => <span className="text-xs font-semibold text-slate-800">{formatCurrency(row.getValue("sellingPrice"))}</span>,
    },
    {
      accessorKey: "minimumStock",
      header: "Min. Stok",
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.getValue("minimumStock")} {row.original.unit}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.MEDICINES.DETAIL(m.id)}>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detail
              </Button>
            </Link>
            <Link href={ROUTES.MEDICINES.EDIT(m.id)}>
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Katalog & Master Obat"
        description="Kelola daftar obat farmasi, harga beli/jual, dan batas minimum stok pengingat."
        actions={
          <div className="flex items-center gap-2">
            <Link href={ROUTES.INVENTORY.LIST}>
              <Button variant="outline" size="sm" className="text-xs">
                <Boxes className="h-4 w-4 mr-1.5" />
                Lihat Stok Batch (FEFO)
              </Button>
            </Link>
            <Link href={ROUTES.MEDICINES.NEW}>
              <Button size="sm" className="font-semibold shadow-xs">
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah Obat Baru
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={medicines}
        searchKey="name"
        searchPlaceholder="Cari nama obat atau kode..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
