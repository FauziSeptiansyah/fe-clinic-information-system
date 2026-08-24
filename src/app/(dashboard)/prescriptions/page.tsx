"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Prescription } from "@/types";
import { prescriptionService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Eye, Pill, ShoppingBag } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await prescriptionService.getAll();
        setPrescriptions(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "prescriptionNumber",
      header: "No. Resep",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {row.getValue("prescriptionNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const rx = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(rx.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {rx.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{rx.patientMrNumber}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "doctorName",
      header: "Dokter Penulis Resep",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
    },
    {
      accessorKey: "items",
      header: "Daftar Obat",
      cell: ({ row }) => {
        const items = row.original.items;
        return (
          <span className="text-xs text-slate-700 line-clamp-1">
            {items.map((i) => `${i.medicineName} (${i.quantity} ${i.unit})`).join(", ")}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Waktu Resep",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDateTime(row.getValue("createdAt"))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status Farmasi",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="prescription" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const rx = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.PRESCRIPTIONS.DETAIL(rx.id)}>
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detail
              </Button>
            </Link>
            <Link href={ROUTES.PHARMACY}>
              <Button size="sm" variant="default" className="text-xs h-8 bg-purple-700 hover:bg-purple-800">
                <Pill className="h-3.5 w-3.5 mr-1" />
                Dispense
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
        title="Resep Elektronik Pasien (E-Prescriptions)"
        description="Daftar seluruh resep obat dari poliklinik yang masuk ke loket farmasi."
        actions={
          <Link href={ROUTES.PHARMACY}>
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800 font-semibold shadow-xs">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Papan Dispensing Farmasi
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={prescriptions}
        searchKey="patientName"
        searchPlaceholder="Cari resep nama pasien..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
