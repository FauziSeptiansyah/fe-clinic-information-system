"use client";

import * as React from "react";
import Link from "next/link";
import { auditLogService } from "@/services";
import { AuditLog } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await auditLogService.getAll();
        setLogs(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Waktu Aktivitas",
      cell: ({ row }) => <span className="text-xs text-slate-600 font-mono">{formatDateTime(row.getValue("timestamp"))}</span>,
    },
    {
      accessorKey: "userName",
      header: "Pengguna & Peran",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{row.getValue("userName")}</span>
          <p className="text-[10px] text-slate-500 font-mono">{row.original.userRole}</p>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const act = row.getValue("action") as string;
        const color: "default" | "secondary" | "destructive" = act === "CREATE" ? "default" : act === "UPDATE" ? "secondary" : "destructive";
        return <Badge variant={color} className="text-[10px]">{act}</Badge>;
      },
    },
    {
      accessorKey: "entityType",
      header: "Modul / Entitas",
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-blue-700">{row.getValue("entityType")}</span>,
    },
    {
      accessorKey: "details",
      header: "Keterangan Audit",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("details")}</span>,
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => <span className="text-xs text-slate-400 font-mono">{row.getValue("ipAddress") || "-"}</span>,
    },
  ];

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Link href={ROUTES.SETTINGS.INDEX} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Pengaturan
        </Link>
      </div>

      <PageHeader
        title="Jejak Audit & Log Keamanan Sistem"
        description="Pencatatan kronologis aktivitas staf, modifikasi rekam medis, billing, dan pergerakan stok farmasi."
      />

      <DataTable
        columns={columns}
        data={logs}
        searchKey="userName"
        searchPlaceholder="Cari nama pengguna..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
