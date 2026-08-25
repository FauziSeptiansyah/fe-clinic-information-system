"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Visit } from "@/types";
import { visitService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/config/permissionConfig";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Stethoscope, Eye } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function VisitsPage() {
  const role = useAuthStore((s) => s.role);
  const canExamine = hasPermission(role || undefined, "visits.examine");
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const list = await visitService.getAll();
        setVisits(list);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Visit>[] = [
    {
      accessorKey: "queueNumber",
      header: "Antrian",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("queueNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(v.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {v.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{v.patientMrNumber} • {v.patientAge} thn</p>
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-800">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "doctorName",
      header: "Dokter",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
    },
    {
      id: "primaryDiagnosis",
      header: "Diagnosa Utama",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-900">{row.original.doctorExamination?.primaryDiagnosis || "-"}</span>,
    },
    {
      accessorKey: "payerType",
      header: "Penjamin",
      cell: ({ row }) => {
        const p = row.original.payerType;
        const cfg = PAYER_CONFIG[p] || { label: p, badgeVariant: "outline" as const };
        const variant = (cfg.badgeVariant || "outline") as "default" | "secondary" | "destructive" | "outline";
        return <Badge variant={variant} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="visit" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const v = row.original;
        const actionable = v.status === "WAITING_DOCTOR" && canExamine;
        return (
          <Link href={ROUTES.VISITS.DETAIL(v.id)}>
            <Button size="sm" variant={actionable ? "default" : "outline"} className="text-xs h-8 font-semibold shadow-xs">
              {actionable ? <Stethoscope className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              {actionable ? "Periksa" : "Lihat"}
            </Button>
          </Link>
        );
      },
    },
  ];

  const waitingDoctor = visits.filter((v) => v.status === "WAITING_DOCTOR");
  const history = visits.filter((v) => v.status !== "WAITING_DOCTOR");

  return (
    <PageContainer>
      <PageHeader
        title="Kunjungan & Pemeriksaan Medis"
        description="Pasien yang menunggu diperiksa, dan riwayat kunjungan yang sudah berjalan."
      />

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">Menunggu Diperiksa ({waitingDoctor.length})</h2>
        <DataTable
          columns={columns}
          data={waitingDoctor}
          searchKey="patientName"
          searchPlaceholder="Cari nama pasien..."
          isLoading={isLoading}
        />
      </div>

      <div className="space-y-2 pt-4">
        <h2 className="text-sm font-bold text-slate-900">Riwayat Kunjungan</h2>
        <DataTable
          columns={columns}
          data={history}
          searchKey="patientName"
          searchPlaceholder="Cari nama pasien atau diagnosa..."
          isLoading={isLoading}
        />
      </div>
    </PageContainer>
  );
}
