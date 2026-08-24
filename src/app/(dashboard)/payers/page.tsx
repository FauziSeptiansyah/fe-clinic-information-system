"use client";

import * as React from "react";
import { masterService } from "@/services";
import { Payer } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function PayersPage() {
  const [payers, setPayers] = React.useState<Payer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await masterService.getPayers();
        setPayers(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Payer>[] = [
    {
      accessorKey: "code",
      header: "Kode Payer",
      cell: ({ row }) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Penjamin / Asuransi",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "type",
      header: "Jenis Skema",
      cell: ({ row }) => {
        const t = row.original.type;
        const cfg = PAYER_CONFIG[t] || { label: t, badgeVariant: "outline" as const };
        return <Badge variant={cfg.badgeVariant} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "description",
      header: "Keterangan Kerjasama",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.getValue("description")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Master Penjamin & Asuransi (Payers)"
        description="Pengaturan skema pembayaran pasien: Umum, BPJS Kesehatan, Asuransi Swasta, dan Korporat."
      />

      <DataTable
        columns={columns}
        data={payers}
        searchKey="name"
        searchPlaceholder="Cari penjamin..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
