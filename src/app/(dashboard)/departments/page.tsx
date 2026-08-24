"use client";

import * as React from "react";
import { masterService } from "@/services";
import { Department } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ code: "", name: "", roomNumber: "", description: "", status: "ACTIVE" as const });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getDepartments();
      setDepartments(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await masterService.createDepartment(formData);
      toast.success("Poliklinik berhasil ditambahkan.");
      setOpenModal(false);
      loadData();
    } catch {
      toast.error("Gagal menambahkan departemen.");
    }
  };

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "code",
      header: "Kode Poli",
      cell: ({ row }) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Poliklinik / Ruangan",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "roomNumber",
      header: "Ruangan",
      cell: ({ row }) => <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{row.getValue("roomNumber") || "-"}</span>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
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
        title="Master Poliklinik & Departemen"
        description="Struktur poliklinik rawat jalan, poli spesialis, laboratorium diagnostik, dan instalasi farmasi."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Poliklinik
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={departments}
        searchKey="name"
        searchPlaceholder="Cari nama poliklinik..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Poliklinik / Departemen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Kode Poliklinik</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Cth: UMUM" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nomor Ruangan</Label>
                <Input value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} placeholder="Cth: R. 101" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Poliklinik</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Poli Penyakit Dalam" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deskripsi Layanan</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Cth: Konsultasi medis organ dalam..." required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
