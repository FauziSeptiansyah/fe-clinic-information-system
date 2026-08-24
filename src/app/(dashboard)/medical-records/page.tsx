"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { MedicalRecord } from "@/types";
import { medicalRecordService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function MedicalRecordsPage() {
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const list = await medicalRecordService.getAll();
        setRecords(list);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<MedicalRecord>[] = [
    {
      accessorKey: "date",
      header: "Tanggal Periksa",
      cell: ({ row }) => <span className="font-medium text-xs text-slate-800">{formatDate(row.getValue("date"), "dd MMM yyyy")}</span>,
    },
    {
      accessorKey: "patientName",
      header: "Nama Pasien",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(r.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {r.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{r.patientMrNumber}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "doctorName",
      header: "Dokter",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
    },
    {
      accessorKey: "primaryDiagnosis",
      header: "Diagnosa Utama",
      cell: ({ row }) => <span className="text-xs font-semibold text-slate-900">{row.getValue("primaryDiagnosis")}</span>,
    },
    {
      accessorKey: "treatment",
      header: "Terapi / Tindakan",
      cell: ({ row }) => <span className="text-xs text-slate-600 line-clamp-1">{row.getValue("treatment")}</span>,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <Link href={ROUTES.MEDICAL_RECORDS.DETAIL(r.id)}>
            <Button size="sm" variant="outline" className="text-xs h-8">
              <Eye className="h-3.5 w-3.5 mr-1" />
              Detail RME
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Rekam Medis Elektronik (RME)"
        description="Arsip data riwayat medis pasien, diagnosa ICD, dan terapi yang tercatat di klinik."
      />

      <DataTable
        columns={columns}
        data={records}
        searchKey="patientName"
        searchPlaceholder="Cari rekam medis pasien..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
