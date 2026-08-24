"use client";

import * as React from "react";
import { doctorService, masterService } from "@/services";
import { Doctor, Department } from "@/types";
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
import { toast } from "sonner";

export default function DoctorsPage() {
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<Doctor, "id">>({
    name: "",
    licenseNumber: "",
    specialization: "",
    departmentId: "",
    departmentName: "",
    phone: "",
    email: "",
    status: "ACTIVE",
    schedules: [
      { id: "sch-new", day: "SENIN", startTime: "08:00", endTime: "14:00", departmentId: "", departmentName: "" }
    ],
  });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [docs, depts] = await Promise.all([
        doctorService.getAll(),
        masterService.getDepartments(),
      ]);
      setDoctors(docs);
      setDepartments(depts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    try {
      await doctorService.create({
        ...formData,
        departmentName: dept?.name || "Poli Umum",
      });
      toast.success("Dokter berhasil didaftarkan.");
      setOpenModal(false);
      loadData();
    } catch {
      toast.error("Gagal menambahkan dokter.");
    }
  };

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "name",
      header: "Nama Dokter & Gelar",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-xs text-slate-900">{row.getValue("name")}</span>
          <p className="text-[11px] text-slate-500 font-mono">SIP: {row.original.licenseNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "specialization",
      header: "Spesialisasi",
      cell: ({ row }) => <span className="text-xs font-medium text-blue-700">{row.getValue("specialization")}</span>,
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik",
      cell: ({ row }) => <span className="text-xs text-slate-800">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "phone",
      header: "Kontak",
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-slate-800">{row.getValue("phone")}</span>
          <p className="text-[11px] text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "schedules",
      header: "Jadwal Praktik",
      cell: ({ row }) => {
        const schs = row.original.schedules || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {schs.map((s) => (
              <Badge key={s.id} variant="outline" className="text-[10px] bg-slate-50">
                {s.day.slice(0, 3)} ({s.startTime}-{s.endTime})
              </Badge>
            ))}
          </div>
        );
      },
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
        title="Master Dokter & Tenaga Medis"
        description="Pengaturan dokter spesialis, nomor SIP, departemen poliklinik, dan jadwal praktik."
        actions={
          <Button size="sm" onClick={() => setOpenModal(true)} className="font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Dokter
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={doctors}
        searchKey="name"
        searchPlaceholder="Cari nama dokter..."
        isLoading={isLoading}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Dokter Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="dr. Fauzi Ahmad, Sp.PD" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nomor SIP</Label>
                <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="SIP.446/001/DS/2023" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Spesialisasi</Label>
                <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="Dokter Umum / Sp.PD" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Poliklinik Penempatan</Label>
              <Select value={formData.departmentId} onValueChange={(val) => setFormData({ ...formData, departmentId: val })}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih Poliklinik..." /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">No. HP / WA</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="08123456789" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="dokter@klinik.co.id" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>Batal</Button>
              <Button type="submit">Simpan Dokter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
