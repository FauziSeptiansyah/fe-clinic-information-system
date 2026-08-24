"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Supplier } from "@/types";
import { supplierService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<Supplier, "id">>({
    code: "",
    name: "",
    pic: "",
    phone: "",
    email: "",
    address: "",
    npwp: "",
    status: "ACTIVE",
  });

  const loadSuppliers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supplierService.create(formData);
      toast.success("Supplier berhasil ditambahkan.");
      setOpenModal(false);
      loadSuppliers();
    } catch {
      toast.error("Gagal menambahkan supplier.");
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: "Nama Distributor / Supplier",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>
          <p className="text-[11px] text-slate-500">PIC: {row.original.pic}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Kontak / Email",
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-slate-800">{row.getValue("phone")}</span>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Alamat",
      cell: ({ row }) => <span className="text-xs text-slate-600 line-clamp-1">{row.getValue("address")}</span>,
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
        title="Distributor & Supplier Obat (PBF)"
        description="Kelola data Pedagang Besar Farmasi (PBF) rekanan pengadaan obat klinik."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Supplier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Cari nama supplier..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Distributor / Supplier Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Kode Supplier</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="SUP-01" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nama Distributor</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="PT Kimia Farma" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nama PIC</Label>
                <Input value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} placeholder="Bpk. Anton" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nomor Telepon</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="021-3847709" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Distributor</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="sales@distributor.com" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Alamat Lengkap</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Jl. Budi Utomo No. 1" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>Batal</Button>
              <Button type="submit">Simpan Supplier</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
