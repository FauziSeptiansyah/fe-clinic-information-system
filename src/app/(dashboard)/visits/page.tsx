"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Visit } from "@/types";
import { visitService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Stethoscope, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function VisitsPage() {
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
      accessorKey: "primaryDiagnosis",
      header: "Diagnosa Utama",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-900">{row.getValue("primaryDiagnosis") || "-"}</span>,
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
        return (
          <Link href={ROUTES.VISITS.DETAIL(v.id)}>
            <Button size="sm" variant="default" className="text-xs h-8 font-semibold shadow-xs">
              <Stethoscope className="h-3.5 w-3.5 mr-1" />
              Periksa (SOAP)
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Kunjungan & Pemeriksaan Medis"
        description="Pencatatan pemeriksaan fisik (SOAP), vital signs, diagnosis ICD, tindakan, dan resep obat."
        actions={
          <Link href={ROUTES.REGISTRATIONS.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Pendaftaran Baru
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={visits}
        searchKey="patientName"
        searchPlaceholder="Cari nama pasien atau diagnosa..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
