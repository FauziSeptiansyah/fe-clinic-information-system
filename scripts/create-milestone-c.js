const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log("Created: " + filePath);
}

// 1. Dashboard (/dashboard) - Role-Aware
writeFile("src/app/(dashboard)/dashboard/page.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import {
  Users,
  Calendar,
  ListOrdered,
  CreditCard,
  Pill,
  AlertTriangle,
  Stethoscope,
  TrendingUp,
  ArrowRight,
  Plus,
  Tv,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard, CurrencyDisplay } from "@/components/common/Displays";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  patientService,
  doctorService,
  queueService,
  visitService,
  medicineService,
  billingService,
  paymentService,
  inventoryService,
} from "@/services";
import { ROUTES } from "@/config/routes";
import { Queue, Patient, Medicine, Visit } from "@/types";

export default function DashboardPage() {
  const { user, role } = useAuthStore();
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [invSummary, setInvSummary] = React.useState<any>(null);
  const [revenue, setRevenue] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [pts, qs, vs, meds, inv, pays] = await Promise.all([
          patientService.getAll(),
          queueService.getAll(),
          visitService.getAll(),
          medicineService.getAll(),
          inventoryService.getSummary(),
          paymentService.getAll(),
        ]);
        setPatients(pts);
        setQueues(qs);
        setVisits(vs);
        setMedicines(meds);
        setInvSummary(inv);
        const totalRev = pays.reduce((sum, p) => sum + p.amount, 0);
        setRevenue(totalRev);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeQueues = queues.filter((q) => q.status === "WAITING" || q.status === "CALLED" || q.status === "IN_SERVICE");
  const lowStockMeds = medicines.filter((m) => m.currentStock <= m.minimumStock);

  return (
    <PageContainer>
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang, {user?.name || "Staf Medis"}
            </h1>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-semibold">
              {role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-blue-100">
            Sistem Informasi Manajemen Klinik Pratama Sehat Bersama • Hari ini: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
          <Link href={ROUTES.REGISTRATIONS.NEW}>
            <Button size="sm" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Daftar Pasien
            </Button>
          </Link>
          <Link href={ROUTES.QUEUES.DISPLAY}>
            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 font-semibold text-xs">
              <Tv className="h-4 w-4 mr-1.5" />
              Layar Antrian TV
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pasien Terdaftar"
          value={patients.length}
          description="Pasien aktif dalam rekam medis"
          icon={Users}
          trend={{ value: "+4.5%", positive: true }}
        />
        <StatCard
          title="Kunjungan Hari Ini"
          value={visits.length}
          description="Total pasien registrasi hari ini"
          icon={Calendar}
          trend={{ value: "+12%", positive: true }}
        />
        <StatCard
          title="Antrian Berjalan"
          value={activeQueues.length}
          description="Menunggu & sedang diperiksa"
          icon={ListOrdered}
        />
        <StatCard
          title="Total Pendapatan (Kasir)"
          value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(revenue)}
          description="Penerimaan tunai, QRIS & asuransi"
          icon={CreditCard}
          trend={{ value: "+8.1%", positive: true }}
        />
      </div>

      {/* Main Grid: Active Queues & Quick Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Queues Board */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-blue-600" />
                Antrian Poliklinik Saat Ini
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Daftar antrian pasien yang sedang menunggu atau dipanggil
              </CardDescription>
            </div>
            <Link href={ROUTES.QUEUES.LIST}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activeQueues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada antrian aktif saat ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeQueues.slice(0, 6).map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-sm text-blue-700">
                        {q.queueNumber}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{q.patientName}</p>
                        <p className="text-xs text-slate-500">{q.departmentName} • {q.doctorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={q.status} type="queue" />
                      <Link href={ROUTES.QUEUES.LIST}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          Proses
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side Widgets: Low Stock Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <Card className="shadow-xs border-amber-200 bg-amber-50/20">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Peringatan Stok Obat Menipis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              {lowStockMeds.length === 0 ? (
                <p className="text-xs text-slate-500">Seluruh stok obat berada dalam batas aman.</p>
              ) : (
                lowStockMeds.slice(0, 3).map((med) => (
                  <div key={med.id} className="flex items-center justify-between bg-white p-2.5 rounded border border-amber-200 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-red-600 font-medium">Sisa: {med.currentStock} {med.unit} (Min: {med.minimumStock})</p>
                    </div>
                    <Link href={ROUTES.PURCHASES.NEW}>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] border-amber-300 text-amber-800 hover:bg-amber-50">
                        Order PO
                      </Button>
                    </Link>
                  </div>
                ))
              )}
              <Link href={ROUTES.INVENTORY.LIST} className="block pt-1 text-center">
                <span className="text-xs font-semibold text-blue-600 hover:underline">
                  Kelola Seluruh Inventori & FEFO →
                </span>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Aksi Cepat Medis</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2">
              <Link href={ROUTES.REGISTRATIONS.NEW} className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                  <Plus className="h-4 w-4 mr-2 text-blue-600" />
                  Registrasi Pasien Baru
                </Button>
              </Link>
              <Link href={ROUTES.VISITS.LIST} className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                  <Stethoscope className="h-4 w-4 mr-2 text-emerald-600" />
                  Pemeriksaan SOAP Pasien
                </Button>
              </Link>
              <Link href={ROUTES.PHARMACY} className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                  <Pill className="h-4 w-4 mr-2 text-purple-600" />
                  Dispensing Farmasi & Obat
                </Button>
              </Link>
              <Link href={ROUTES.PAYMENTS} className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 font-medium">
                  <CreditCard className="h-4 w-4 mr-2 text-amber-600" />
                  Penerimaan Pembayaran Kasir
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
`);

// 2. Patients List (/patients)
writeFile("src/app/(dashboard)/patients/page.tsx", `
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
import { Plus, MoreHorizontal, Eye, Edit, Trash2, UserPlus, FileText } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deletePatientId, setDeletePatientId] = React.useState<string | null>(null);

  const fetchPatients = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
    } catch {
      toast.error("Gagal memuat data pasien.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async () => {
    if (!deletePatientId) return;
    try {
      await patientService.delete(deletePatientId);
      toast.success("Pasien berhasil dihapus.");
      fetchPatients();
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
        const cfg = PAYER_CONFIG[payer] || { label: payer, badgeVariant: "outline" };
        return <Badge variant={cfg.badgeVariant as any} className="text-xs">{cfg.label}</Badge>;
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
              <DropdownMenuItem onClick={() => router.push(\`\${ROUTES.REGISTRATIONS.NEW}?patientId=\${p.id}\`)}>
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
`);

// 3. Patient Form Component (Reused for /patients/new & /patients/[id]/edit)
writeFile("src/features/patients/PatientForm.tsx", `
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormValues } from "@/schemas";
import { Patient } from "@/types";
import { patientService } from "@/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface PatientFormProps {
  mode: "create" | "edit";
  initialData?: Patient;
}

export function PatientForm({ mode, initialData }: PatientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          nickname: initialData.nickname || "",
          nik: initialData.nik,
          birthPlace: initialData.birthPlace,
          birthDate: initialData.birthDate,
          gender: initialData.gender,
          bloodType: initialData.bloodType,
          phone: initialData.phone,
          email: initialData.email || "",
          address: initialData.address,
          province: initialData.province,
          city: initialData.city,
          district: initialData.district,
          village: initialData.village,
          postalCode: initialData.postalCode,
          allergy: initialData.allergy || "",
          specialNotes: initialData.specialNotes || "",
          payer: initialData.payer,
          insuranceNumber: initialData.insuranceNumber || "",
          company: initialData.company || "",
          sepNumber: initialData.sepNumber || "",
          faskes1: initialData.faskes1 || "",
          referralType: initialData.referralType || "",
          status: initialData.status,
        }
      : {
          gender: "MALE",
          bloodType: "-",
          payer: "GENERAL",
          province: "DKI Jakarta",
          city: "Jakarta Selatan",
          district: "Kebayoran Baru",
          village: "Melawai",
          postalCode: "12160",
          status: "ACTIVE",
        },
  });

  const payerValue = watch("payer");
  const genderValue = watch("gender");
  const bloodTypeValue = watch("bloodType");
  const statusValue = watch("status");

  const onSubmit = async (values: PatientFormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === "create") {
        const newPatient = await patientService.create(values as any);
        toast.success(\`Pasien \${newPatient.fullName} berhasil didaftarkan.\`);
        router.push(ROUTES.PATIENTS.DETAIL(newPatient.id));
      } else if (mode === "edit" && initialData) {
        await patientService.update(initialData.id, values);
        toast.success("Data pasien berhasil diperbarui.");
        router.push(ROUTES.PATIENTS.DETAIL(initialData.id));
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data pasien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.PATIENTS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Data Pasien
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.PATIENTS.LIST}>
            <Button type="button" variant="outline" size="sm">Batal</Button>
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold shadow-xs">
            <Save className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Menyimpan..." : mode === "create" ? "Daftarkan Pasien" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* 1. Informasi Identitas Pasien */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">1. Informasi Identitas Pribadi</CardTitle>
          <CardDescription className="text-xs text-slate-500">Data identitas resmi sesuai KTP / Dokumen Kependudukan.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nama Lengkap Pasien"
            required
            placeholder="Cth: Ahmad Rizky Pratama"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <FormInput
            label="Nama Panggilan / Alias"
            placeholder="Cth: Rizky"
            error={errors.nickname?.message}
            {...register("nickname")}
          />
          <FormInput
            label="NIK (Nomor Induk Kependudukan 16 Digit)"
            required
            maxLength={16}
            placeholder="Cth: 3171012304850001"
            error={errors.nik?.message}
            {...register("nik")}
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Tempat Lahir"
              required
              placeholder="Cth: Jakarta"
              error={errors.birthPlace?.message}
              {...register("birthPlace")}
            />
            <FormInput
              label="Tanggal Lahir"
              type="date"
              required
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />
          </div>

          <FormSelect
            label="Jenis Kelamin"
            required
            value={genderValue}
            onValueChange={(val) => setValue("gender", val as any)}
            options={[
              { label: "Laki-laki (Male)", value: "MALE" },
              { label: "Perempuan (Female)", value: "FEMALE" },
            ]}
          />

          <FormSelect
            label="Golongan Darah"
            value={bloodTypeValue}
            onValueChange={(val) => setValue("bloodType", val as any)}
            options={[
              { label: "Belum Tahu / Tidak Dicatat (-)", value: "-" },
              { label: "A", value: "A" },
              { label: "B", value: "B" },
              { label: "AB", value: "AB" },
              { label: "O", value: "O" },
            ]}
          />
        </CardContent>
      </Card>

      {/* 2. Kontak & Alamat */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">2. Kontak & Alamat Domisili</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nomor Telepon / WhatsApp"
              required
              placeholder="Cth: 081298765432"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <FormInput
              label="Email (Opsional)"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <FormTextarea
            label="Alamat Lengkap (Jalan, RT/RW, No. Rumah)"
            required
            placeholder="Cth: Jl. Melawai IX No. 20, RT 02 / RW 04"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormInput label="Provinsi" required error={errors.province?.message} {...register("province")} />
            <FormInput label="Kota / Kab" required error={errors.city?.message} {...register("city")} />
            <FormInput label="Kecamatan" required error={errors.district?.message} {...register("district")} />
            <FormInput label="Kelurahan / Desa" required error={errors.village?.message} {...register("village")} />
          </div>
          <div className="w-full sm:w-1/4">
            <FormInput label="Kode Pos" required maxLength={5} error={errors.postalCode?.message} {...register("postalCode")} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Penjamin & Asuransi (Termasuk BPJS) */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">3. Penjamin & Asuransi</CardTitle>
          <CardDescription className="text-xs text-slate-500">Pilih skema pembiayaan pengobatan pasien.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Jenis Penjamin (Payer)"
              required
              value={payerValue}
              onValueChange={(val) => setValue("payer", val as any)}
              options={[
                { label: "Umum / Bayar Mandiri", value: "GENERAL" },
                { label: "BPJS Kesehatan", value: "BPJS" },
                { label: "Asuransi Swasta", value: "INSURANCE" },
                { label: "Perusahaan / Corporate", value: "CORPORATE" },
              ]}
            />
            {payerValue !== "GENERAL" && (
              <FormInput
                label="Nomor Kartu / Polis Asuransi"
                placeholder="Cth: 0001234567891"
                error={errors.insuranceNumber?.message}
                {...register("insuranceNumber")}
              />
            )}
          </div>

          {/* Conditional BPJS specific fields */}
          {payerValue === "BPJS" && (
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput
                label="Nomor SEP (Surat Eligibilitas Peserta)"
                placeholder="Cth: SEP-20260824-0012"
                error={errors.sepNumber?.message}
                {...register("sepNumber")}
              />
              <FormInput
                label="Faskes Tingkat 1 Rujukan"
                placeholder="Cth: Puskesmas Kebayoran"
                error={errors.faskes1?.message}
                {...register("faskes1")}
              />
              <FormInput
                label="Jenis Rujukan"
                placeholder="Cth: Faskes 1 Mandiri / Vertikal"
                error={errors.referralType?.message}
                {...register("referralType")}
              />
            </div>
          )}

          {payerValue === "CORPORATE" && (
            <FormInput
              label="Nama Perusahaan Penjamin"
              placeholder="Cth: PT Telkom Indonesia"
              error={errors.company?.message}
              {...register("company")}
            />
          )}
        </CardContent>
      </Card>

      {/* 4. Riwayat Medis & Catatan Khusus */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">4. Alergi & Catatan Medis Khusus</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Riwayat Alergi Obat / Makanan"
            placeholder="Cth: Amoxicillin, Paracetamol, Udang, Debu"
            error={errors.allergy?.message}
            {...register("allergy")}
          />
          <FormInput
            label="Catatan Khusus / Riwayat Penyakit Kronis"
            placeholder="Cth: Hipertensi, DM Tipe 2, Asma"
            error={errors.specialNotes?.message}
            {...register("specialNotes")}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Link href={ROUTES.PATIENTS.LIST}>
          <Button type="button" variant="outline">Batal</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-sm px-6">
          <Save className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Daftarkan Pasien" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
`);

// 4. Patients New (/patients/new)
writeFile("src/app/(dashboard)/patients/new/page.tsx", `
"use client";

import * as React from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { PatientForm } from "@/features/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Pendaftaran Pasien Baru"
        description="Formulir pencatatan rekam medis pasien baru untuk integrasi layanan poliklinik."
      />
      <PatientForm mode="create" />
    </PageContainer>
  );
}
`);

// 5. Patients Detail (/patients/[id])
writeFile("src/app/(dashboard)/patients/[id]/page.tsx", `
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Patient, Visit, MedicalRecord, Prescription, Invoice } from "@/types";
import { patientService, visitService, medicalRecordService, prescriptionService, billingService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DetailCard, DetailRow, CurrencyDisplay } from "@/components/common/Displays";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, UserPlus, Stethoscope, FileText, Pill, CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [medicalRecords, setMedicalRecords] = React.useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [p, vs, mrs, rxs, invs] = await Promise.all([
          patientService.getById(id),
          visitService.getAll(),
          medicalRecordService.getByPatientId(id),
          prescriptionService.getAll(),
          billingService.getAll(),
        ]);
        setPatient(p);
        setVisits(vs.filter((v) => v.patientId === id));
        setMedicalRecords(mrs);
        setPrescriptions(rxs.filter((r) => r.patientId === id));
        setInvoices(invs.filter((i) => i.patientId === id));
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Memuat data rekam medis pasien..." />
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer>
        <ErrorState
          title="Pasien Tidak Ditemukan"
          description="Data pasien dengan ID tersebut tidak tersedia dalam basis data."
          onRetry={() => router.push(ROUTES.PATIENTS.LIST)}
        />
      </PageContainer>
    );
  }

  const age = calculateAge(patient.birthDate);
  const payerCfg = PAYER_CONFIG[patient.payer] || { label: patient.payer, badgeVariant: "outline" };

  return (
    <PageContainer>
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link href={ROUTES.PATIENTS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Data Pasien
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.PATIENTS.EDIT(patient.id)}>
            <Button variant="outline" size="sm">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Ubah Data
            </Button>
          </Link>
          <Link href={\`\${ROUTES.REGISTRATIONS.NEW}?patientId=\${patient.id}\`}>
            <Button size="sm" className="font-semibold shadow-xs">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Daftarkan Berobat
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0 border-2 border-blue-200">
                {patient.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.fullName}</h1>
                  <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                    {patient.mrNumber}
                  </Badge>
                  <StatusBadge status={patient.status} />
                </div>
                <p className="text-xs text-slate-500">
                  {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {age} Tahun ({formatDate(patient.birthDate, "dd MMMM yyyy")}) • NIK: <span className="font-mono">{patient.nik}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant={payerCfg.badgeVariant as any} className="text-xs">{payerCfg.label}</Badge>
                  {patient.allergy && (
                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Alergi: {patient.allergy}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="overview">Ringkasan Profil</TabsTrigger>
          <TabsTrigger value="visits">Riwayat Kunjungan ({visits.length})</TabsTrigger>
          <TabsTrigger value="medical-records">Rekam Medis ({medicalRecords.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Resep Obat ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="billing">Tagihan & Kasir ({invoices.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailCard title="Informasi Identitas & Domisili">
              <DetailRow label="Nama Lengkap" value={patient.fullName} />
              <DetailRow label="Nama Panggilan" value={patient.nickname || "-"} />
              <DetailRow label="Tempat, Tanggal Lahir" value={\`\${patient.birthPlace}, \${formatDate(patient.birthDate)}\`} />
              <DetailRow label="Golongan Darah" value={patient.bloodType} />
              <DetailRow label="Nomor Telepon" value={patient.phone} />
              <DetailRow label="Email" value={patient.email || "-"} />
              <DetailRow label="Alamat Domisili" value={\`\${patient.address}, \${patient.village}, \${patient.district}, \${patient.city}, \${patient.province} \${patient.postalCode}\`} />
            </DetailCard>

            <DetailCard title="Informasi Penjamin & Asuransi">
              <DetailRow label="Jenis Penjamin" value={<Badge variant={payerCfg.badgeVariant as any}>{payerCfg.label}</Badge>} />
              {patient.insuranceNumber && <DetailRow label="Nomor Polis / Kartu" value={<span className="font-mono">{patient.insuranceNumber}</span>} />}
              {patient.sepNumber && <DetailRow label="Nomor SEP BPJS" value={<span className="font-mono">{patient.sepNumber}</span>} />}
              {patient.faskes1 && <DetailRow label="Faskes Tingkat 1" value={patient.faskes1} />}
              {patient.referralType && <DetailRow label="Jenis Rujukan" value={patient.referralType} />}
              {patient.company && <DetailRow label="Perusahaan Penjamin" value={patient.company} />}
              <DetailRow label="Alergi Pasien" value={<span className="text-red-600 font-semibold">{patient.allergy || "Tidak ada alergi tercatat"}</span>} />
              <DetailRow label="Catatan Khusus" value={patient.specialNotes || "-"} />
            </DetailCard>
          </div>
        </TabsContent>

        {/* Tab 2: Visits */}
        <TabsContent value="visits">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {visits.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada riwayat kunjungan.</div>
              ) : (
                visits.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(v.registrationDate, "dd MMMM yyyy")} • {v.departmentName}</p>
                      <p className="text-xs text-slate-500">Dokter: {v.doctorName} • Keluhan: {v.complaint}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={v.status} type="visit" />
                      <Link href={ROUTES.VISITS.DETAIL(v.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Kunjungan</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Medical Records Timeline */}
        <TabsContent value="medical-records">
          <div className="space-y-4">
            {medicalRecords.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-xs text-slate-500">Belum ada rekam medis tersimpan.</CardContent></Card>
            ) : (
              medicalRecords.map((mr) => (
                <Card key={mr.id} className="shadow-xs border-l-4 border-l-blue-600">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">{formatDate(mr.date, "EEEE, dd MMMM yyyy")}</span>
                      <span className="text-xs text-slate-500">{mr.doctorName} • {mr.departmentName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Keluhan Pasien (Subjective):</p>
                        <p className="text-slate-600 mt-0.5">{mr.complaint}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Tanda Vital (Objective):</p>
                        <p className="text-slate-600 mt-0.5">
                          TD: {mr.vitalSigns.bloodPressure} mmHg | Suhu: {mr.vitalSigns.temperature}°C | Nadi: {mr.vitalSigns.pulse}x/m | SpO2: {mr.vitalSigns.spo2}%
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Diagnosa (Assessment):</p>
                        <p className="text-slate-900 font-semibold mt-0.5">{mr.primaryDiagnosis}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Tindakan & Terapi (Plan):</p>
                        <p className="text-slate-600 mt-0.5">{mr.treatment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Prescriptions */}
        <TabsContent value="prescriptions">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada resep obat tercatat.</div>
              ) : (
                prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rx.prescriptionNumber} • {formatDate(rx.createdAt)}</p>
                      <p className="text-xs text-slate-500">Item: {rx.items.map((i) => \`\${i.medicineName} (\${i.quantity} \${i.unit})\`).join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rx.status} type="prescription" />
                      <Link href={ROUTES.PRESCRIPTIONS.DETAIL(rx.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Resep</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Billing */}
        <TabsContent value="billing">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada riwayat tagihan.</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{inv.invoiceNumber} • {formatDate(inv.createdAt)}</p>
                      <p className="text-xs text-slate-500">Total: <CurrencyDisplay amount={inv.grandTotal} /> • Sisa: <CurrencyDisplay amount={inv.remainingAmount} /></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inv.status} type="invoice" />
                      <Link href={ROUTES.BILLING.DETAIL(inv.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Tagihan</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
`);

// 6. Patients Edit (/patients/[id]/edit)
writeFile("src/app/(dashboard)/patients/[id]/edit/page.tsx", `
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { patientService } from "@/services";
import { Patient } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { PatientForm } from "@/features/patients/PatientForm";

export default function EditPatientPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const p = await patientService.getById(id);
        setPatient(p);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <LoadingState title="Memuat data pasien..." />
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer maxWidth="lg">
        <p className="text-center text-sm text-slate-500">Pasien tidak ditemukan.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title={\`Ubah Data Pasien — \${patient.fullName}\`}
        description={\`Perbarui informasi biodata, kontak, dan penjamin untuk \${patient.mrNumber}\`}
      />
      <PatientForm mode="edit" initialData={patient} />
    </PageContainer>
  );
}
`);

console.log("Finished generating Dashboard & Patient module.");
