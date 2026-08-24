"use client";

import * as React from "react";
import { masterService } from "@/services";
import { Procedure } from "@/types";
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
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ProceduresPage() {
  const [procedures, setProcedures] = React.useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ code: "", name: "", price: 50000, description: "", status: "ACTIVE" as const });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getProcedures();
      setProcedures(data);
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
      await masterService.createProcedure(formData);
      toast.success("Tindakan medis berhasil ditambahkan.");
      setOpenModal(false);
      loadData();
    } catch {
      toast.error("Gagal menambahkan tindakan.");
    }
  };

  const columns: ColumnDef<Procedure>[] = [
    {
      accessorKey: "code",
      header: "Kode Tindakan",
      cell: ({ row }) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Tindakan Medis",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "price",
      header: "Tarif Jasa Medis",
      cell: ({ row }) => <span className="font-bold text-xs text-emerald-700">{formatCurrency(row.getValue("price"))}</span>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.getValue("description") || "-"}</span>,
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
        title="Master Tindakan Medis & Prosedur"
        description="Daftar tindakan keperawatan, bedah minor, hecting luka, nebulizer, dan tindakan gigi."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Tindakan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={procedures}
        searchKey="name"
        searchPlaceholder="Cari tindakan medis..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tindakan Medis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Kode Tindakan</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="PRC-01" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tarif Tindakan (Rp)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Tindakan</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Jahit Luka / Hecting" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deskripsi</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Cth: Penjahitan luka robek..." required />
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
