"use client";

import * as React from "react";
import { masterService } from "@/services";
import { Service } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ServicesPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ code: "", name: "", category: "Konsultasi", price: 50000, description: "", status: "ACTIVE" as const });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getServices();
      setServices(data);
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
      await masterService.createService(formData);
      toast.success("Layanan medis berhasil ditambahkan.");
      setOpenModal(false);
      loadData();
    } catch {
      toast.error("Gagal menambahkan layanan.");
    }
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "code",
      header: "Kode Layanan",
      cell: ({ row }) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Layanan Medis",
      cell: ({ row }) => <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "price",
      header: "Tarif Biaya",
      cell: ({ row }) => <span className="font-bold text-xs text-blue-700">{formatCurrency(row.getValue("price"))}</span>,
    },
    {
      accessorKey: "description",
      header: "Keterangan",
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
        title="Master Layanan Medis & Tarif"
        description="Katalog tarif konsultasi dokter, pemeriksaan laboratorium, dan tindakan diagnostik."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Layanan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={services}
        searchKey="name"
        searchPlaceholder="Cari layanan medis..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Layanan Medis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Kode Layanan</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="SRV-01" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Kategori</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Konsultasi / Laboratorium" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Layanan</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Konsultasi Dokter Spesialis" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tarif Biaya (Rp)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
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
