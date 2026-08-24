"use client";

import * as React from "react";
import { masterService } from "@/services";
import { User, Role } from "@/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function UsersManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", email: "", role: "RECEPTIONIST" as Role, phone: "", status: "ACTIVE" as const });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await masterService.getUsers();
      setUsers(data);
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
      await masterService.createUser(formData);
      toast.success("Pengguna staf berhasil ditambahkan.");
      setOpenModal(false);
      loadData();
    } catch {
      toast.error("Gagal menambahkan pengguna.");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama Pengguna",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Peran / Hak Akses (Role)",
      cell: ({ row }) => <Badge variant="secondary" className="font-mono text-xs">{row.getValue("role")}</Badge>,
    },
    {
      accessorKey: "phone",
      header: "No. HP",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("phone") || "-"}</span>,
    },
    {
      accessorKey: "lastLogin",
      header: "Login Terakhir",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDateTime(row.getValue("lastLogin"))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status Akun",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Pengguna & Staf Klinik"
        description="Daftar akun staf klinik, peran otorisasi, hak akses modul, dan status login."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Pengguna Baru
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Cari nama staf..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Staf Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Lengkap</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Bpk. Wahyu Pratama" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Staf</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="nama@klinik.co.id" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">No. HP</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="08123456789" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Peran Sistem (Role)</Label>
              <Select value={formData.role} onValueChange={(val: Role) => setFormData({ ...formData, role: val })}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN (Administrator)</SelectItem>
                  <SelectItem value="OWNER">OWNER (Pimpinan)</SelectItem>
                  <SelectItem value="RECEPTIONIST">RECEPTIONIST (Pendaftaran)</SelectItem>
                  <SelectItem value="DOCTOR">DOCTOR (Dokter Pemeriksa)</SelectItem>
                  <SelectItem value="NURSE">NURSE (Perawat)</SelectItem>
                  <SelectItem value="PHARMACIST">PHARMACIST (Apoteker)</SelectItem>
                  <SelectItem value="CASHIER">CASHIER (Kasir)</SelectItem>
                  <SelectItem value="WAREHOUSE">WAREHOUSE (Gudang Farmasi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>Batal</Button>
              <Button type="submit">Simpan Pengguna</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
