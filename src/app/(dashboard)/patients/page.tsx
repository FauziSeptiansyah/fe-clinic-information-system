"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Patient } from "@/types";
import { patientService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, UserPlus } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletePatientId, setDeletePatientId] = React.useState<string | null>(null);

  const loadPatients = React.useCallback(() => {
    setIsLoading(true);
    patientService.getAll()
      .then((data) => setPatients(data))
      .catch(() => toast.error("Gagal memuat data pasien."))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    let mounted = true;
    patientService.getAll()
      .then((data) => {
        if (mounted) setPatients(data);
      })
      .catch(() => {
        if (mounted) toast.error("Gagal memuat data pasien.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleDelete = async () => {
    if (!deletePatientId) return;
    try {
      await patientService.delete(deletePatientId);
      toast.success("Pasien berhasil dihapus.");
      loadPatients();
    } catch {
      toast.error("Gagal menghapus data pasien.");
    }
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "mrNumber",
      header: "No. Rekam Medis",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("mrNumber")}
        </span>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Nama Pasien",
      cell: ({ row }) => {
        const p = row.original;
        const age = calculateAge(p.birthDate);
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(p.id)} className="font-semibold text-slate-900 hover:text-blue-600">
              {p.fullName}
            </Link>
            <p className="text-xs text-slate-500">
              {p.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {age} thn ({formatDate(p.birthDate, "dd/MM/yyyy")})
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "nik",
      header: "NIK",
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.getValue("nik")}</span>,
    },
    {
      accessorKey: "phone",
      header: "No. HP / Kontak",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("phone")}</span>,
    },
    {
      accessorKey: "payer",
      header: "Penjamin",
      cell: ({ row }) => {
        const payer = row.original.payer;
        const cfg = PAYER_CONFIG[payer] || { label: payer, badgeVariant: "outline" as const };
        return <Badge variant={cfg.badgeVariant} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "lastVisit",
      header: "Kunjungan Terakhir",
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDate(row.getValue("lastVisit"), "dd MMM yyyy")}</span>,
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
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Aksi Pasien</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(ROUTES.PATIENTS.DETAIL(p.id))}>
                <Eye className="h-3.5 w-3.5 mr-2 text-slate-500" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(ROUTES.PATIENTS.EDIT(p.id))}>
                <Edit className="h-3.5 w-3.5 mr-2 text-slate-500" />
                Ubah Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${ROUTES.REGISTRATIONS.NEW}?patientId=${p.id}`)}>
                <UserPlus className="h-3.5 w-3.5 mr-2 text-blue-600" />
                Daftarkan Berobat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeletePatientId(p.id)} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Hapus Pasien
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Data Pasien"
        description="Kelola rekam data pasien klinik, riwayat kunjungan, dan status penjamin."
        actions={
          <Link href={ROUTES.PATIENTS.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Tambah Pasien Baru
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={patients}
        searchKey="fullName"
        searchPlaceholder="Cari nama pasien atau No RM..."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={!!deletePatientId}
        onOpenChange={(open) => !open && setDeletePatientId(null)}
        title="Hapus Data Pasien"
        description="Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
