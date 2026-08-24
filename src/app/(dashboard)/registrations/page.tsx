"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Queue } from "@/types";
import { queueService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function RegistrationsListPage() {
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const list = await queueService.getAll();
        setQueues(list);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Queue>[] = [
    {
      accessorKey: "queueNumber",
      header: "No. Antrian",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("queueNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(q.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {q.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{q.patientMrNumber}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik Tujuan",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-800">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "doctorName",
      header: "Dokter Pemeriksa",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
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
      accessorKey: "createdAt",
      header: "Waktu Daftar",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDateTime(row.getValue("createdAt"))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status Antrian",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="queue" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: () => {
        return (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.QUEUES.LIST}>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Kelola Antrian
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
        title="Daftar Registrasi Pasien Hari Ini"
        description="Pantau seluruh pendaftaran pasien poliklinik dan status antrian real-time."
        actions={
          <Link href={ROUTES.REGISTRATIONS.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Pendaftaran Pasien Baru
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={queues}
        searchKey="patientName"
        searchPlaceholder="Cari nama pasien terdaftar..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
