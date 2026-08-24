const fs = require("fs");
const path = require("path");

function writeFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log("Created: " + filePath);
}

// 1. Registrations List (/registrations)
writeFile("src/app/(dashboard)/registrations/page.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Queue, Visit } from "@/types";
import { queueService, visitService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus, UserPlus, Stethoscope, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function RegistrationsListPage() {
  const router = useRouter();
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const list = await queueService.getAll();
        setQueues(list);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Queue>[] = [
    {
      accessorKey: "queueNumber",
      header: "No. Antrian",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("queueNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(q.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {q.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{q.patientMrNumber}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik Tujuan",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-800">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "doctorName",
      header: "Dokter Pemeriksa",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
    },
    {
      accessorKey: "payerType",
      header: "Penjamin",
      cell: ({ row }) => {
        const p = row.original.payerType;
        const cfg = PAYER_CONFIG[p] || { label: p, badgeVariant: "outline" };
        return <Badge variant={cfg.badgeVariant as any} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Waktu Daftar",
      cell: ({ row }) => <span className="text-xs text-slate-500">{formatDateTime(row.getValue("createdAt"))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status Antrian",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="queue" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={ROUTES.QUEUES.LIST}>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Kelola Antrian
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
        title="Daftar Registrasi Pasien Hari Ini"
        description="Pantau seluruh pendaftaran pasien poliklinik dan status antrian real-time."
        actions={
          <Link href={ROUTES.REGISTRATIONS.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Pendaftaran Pasien Baru
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={queues}
        searchKey="patientName"
        searchPlaceholder="Cari nama pasien terdaftar..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
`);

// 2. Registrations Wizard (/registrations/new)
writeFile("src/app/(dashboard)/registrations/new/page.tsx", `
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  patientService,
  doctorService,
  masterService,
  queueService,
} from "@/services";
import { Patient, Doctor, Department, Service } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { Search, UserCheck, CheckCircle2, Ticket, Printer, ArrowRight, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function NewRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("");
  const [selectedServiceId, setSelectedServiceId] = React.useState("");
  const [payerType, setPayerType] = React.useState<"GENERAL" | "BPJS" | "INSURANCE" | "CORPORATE">("GENERAL");
  const [complaint, setComplaint] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Success Ticket Modal State
  const [registeredQueue, setRegisteredQueue] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      const [pts, depts, docs, srvs] = await Promise.all([
        patientService.getAll(),
        masterService.getDepartments(),
        doctorService.getAll(),
        masterService.getServices(),
      ]);
      setPatients(pts);
      setDepartments(depts);
      setDoctors(docs);
      setServices(srvs);

      if (preselectedPatientId) {
        const found = pts.find((p) => p.id === preselectedPatientId);
        if (found) {
          setSelectedPatient(found);
          setPayerType(found.payer);
        }
      }
    }
    load();
  }, [preselectedPatientId]);

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nik.includes(searchQuery)
      )
    : patients.slice(0, 5);

  const filteredDoctors = selectedDepartmentId
    ? doctors.filter((d) => d.departmentId === selectedDepartmentId)
    : doctors;

  const filteredServices = selectedDepartmentId
    ? services.filter((s) => s.departmentId === selectedDepartmentId || !s.departmentId)
    : services;

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPayerType(p.payer);
    toast.success(\`Pasien terpilih: \${p.fullName}\`);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setSelectedDoctorId("");
    setSelectedServiceId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Silakan pilih pasien terlebih dahulu.");
      return;
    }
    if (!selectedDepartmentId) {
      toast.error("Silakan pilih poliklinik tujuan.");
      return;
    }
    if (!selectedDoctorId) {
      toast.error("Silakan pilih dokter pemeriksa.");
      return;
    }
    if (!selectedServiceId) {
      toast.error("Silakan pilih layanan.");
      return;
    }
    if (!complaint.trim()) {
      toast.error("Keluhan pasien wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await queueService.createRegistration({
        patientId: selectedPatient.id,
        departmentId: selectedDepartmentId,
        doctorId: selectedDoctorId,
        serviceId: selectedServiceId,
        payerType: payerType,
        registrationDate: new Date().toISOString().split("T")[0],
        complaint: complaint,
        notes: notes,
      });

      setRegisteredQueue(result.queue);
      toast.success(\`Pendaftaran berhasil! Nomor Antrian: \${result.queue.queueNumber}\`);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Alur Pendaftaran & Ambil Nomor Antrian"
        description="Pilih pasien, poliklinik tujuan, dokter, dan cetak tiket nomor antrian."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Selection */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Langkah 1: Pilih Pasien</CardTitle>
              <CardDescription className="text-xs text-slate-500">Cari berdasarkan Nama, Nomor Rekam Medis (RM), atau NIK.</CardDescription>
            </div>
            <Link href={ROUTES.PATIENTS.NEW}>
              <Button type="button" variant="outline" size="sm" className="text-xs text-blue-600 border-blue-200">
                + Pasien Baru Belum Terdaftar
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {selectedPatient ? (
              <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedPatient.fullName}</p>
                    <p className="text-xs text-slate-600">
                      No RM: <span className="font-mono font-bold text-blue-700">{selectedPatient.mrNumber}</span> • NIK: {selectedPatient.nik} • Penjamin: {selectedPatient.payer}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="text-xs text-slate-500 hover:text-red-600">
                  Ganti Pasien
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik Nama Pasien / No RM / NIK..."
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="divide-y divide-slate-100 rounded-md border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">Pasien tidak ditemukan.</div>
                  ) : (
                    filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="p-3 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{p.fullName}</p>
                          <p className="text-[11px] text-slate-500">{p.mrNumber} • NIK: {p.nik} • HP: {p.phone}</p>
                        </div>
                        <Button type="button" size="sm" variant="outline" className="h-7 text-xs">Pilih</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Destination, Doctor & Service */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Langkah 2: Tujuan Poliklinik & Layanan</CardTitle>
            <CardDescription className="text-xs text-slate-500">Pilih poliklinik, dokter yang bertugas, dan jenis layanan.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Poliklinik Tujuan *</Label>
              <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih Poliklinik..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.roomNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Dokter Pemeriksa *</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} disabled={!selectedDepartmentId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={selectedDepartmentId ? "Pilih Dokter..." : "Pilih poliklinik dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Layanan Medis *</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={!selectedDepartmentId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder={selectedDepartmentId ? "Pilih Layanan..." : "Pilih poliklinik dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id}>
                      {srv.name} ({formatCurrency(srv.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Payer & Complaint */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Langkah 3: Keluhan Utama Pasien & Penjamin</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Penjamin Biaya Kunjungan</Label>
                <Select value={payerType} onValueChange={(val: any) => setPayerType(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">Umum / Pembayaran Mandiri</SelectItem>
                    <SelectItem value="BPJS">BPJS Kesehatan (JKN/KIS)</SelectItem>
                    <SelectItem value="INSURANCE">Asuransi Swasta</SelectItem>
                    <SelectItem value="CORPORATE">Perusahaan / Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Keluhan Utama Pasien *</Label>
              <Textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Cth: Demam tinggi 3 hari disertai batuk pilek dan sakit kepala..."
                className="text-xs min-h-[70px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Catatan Tambahan (Opsional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cth: Pasien membawa hasil lab luar, menggunakan kursi roda..."
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Link href={ROUTES.REGISTRATIONS.LIST}>
              <Button type="button" variant="outline" size="sm">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
              <Ticket className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Mendaftarkan..." : "Daftarkan & Buat Nomor Antrian"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Success Antrian Ticket Modal (Supports 80mm Print) */}
      <Dialog open={!!registeredQueue} onOpenChange={() => { setRegisteredQueue(null); router.push(ROUTES.QUEUES.LIST); }}>
        <DialogContent className="max-w-sm p-6 text-center">
          <div className="thermal-receipt space-y-3">
            <div className="text-center border-b border-slate-300 pb-2">
              <h3 className="font-bold text-sm">KLINIK SEHAT PRATAMA</h3>
              <p className="text-[10px] text-slate-500">Jl. Kesehatan Medika No. 88, Jakarta</p>
              <p className="text-[10px] text-slate-500">Telp: 021-78901234</p>
            </div>

            <div className="py-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">NOMOR ANTRIAN</p>
              <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight my-1">
                {registeredQueue?.queueNumber}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold">
                {registeredQueue?.departmentName}
              </Badge>
            </div>

            <div className="border-t border-b border-slate-200 py-2 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien:</span>
                <span className="font-semibold truncate max-w-[140px]">{registeredQueue?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No RM:</span>
                <span className="font-mono font-semibold">{registeredQueue?.patientMrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dokter:</span>
                <span className="truncate max-w-[140px]">{registeredQueue?.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penjamin:</span>
                <span>{registeredQueue?.payerType}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Silakan duduk menunggu panggilan suara / tampilan layar monitor TV. Terima kasih.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="w-full text-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Cetak Tiket (80mm)
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => { setRegisteredQueue(null); router.push(ROUTES.QUEUES.LIST); }}
              className="w-full text-xs font-semibold"
            >
              Lanjut ke Papan Antrian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
`);

// 3. Queues Board (/queues) with Real-Time Zustand Store
writeFile("src/app/(dashboard)/queues/page.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue, QueueStatus } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Volume2,
  Play,
  SkipForward,
  CheckCircle,
  XCircle,
  Tv,
  Plus,
  RefreshCw,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";

export default function QueuesBoardPage() {
  const { queues, setQueues, updateQueueStatus } = useQueueStore();
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>("ALL");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchQueues = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await queueService.getAll();
      setQueues(data);
    } finally {
      setIsLoading(false);
    }
  }, [setQueues]);

  React.useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleAction = async (queueId: string, action: QueueStatus, label: string) => {
    try {
      await queueService.updateStatus(queueId, action);
      updateQueueStatus(queueId, action);
      toast.success(\`Antrian berhasil di-\${label}.\`);
    } catch {
      toast.error("Gagal memperbarui status antrian.");
    }
  };

  const handleCallAudio = (queue: Queue) => {
    handleAction(queue.id, "CALLED", "panggil");
    toast.info(\`Memanggil nomor antrian: \${queue.queueNumber} menuju \${queue.departmentName}\`);
  };

  const departments = Array.from(new Set(queues.map((q) => q.departmentName)));

  const filteredQueues = queues.filter((q) => {
    if (selectedDepartment !== "ALL") return q.departmentName === selectedDepartment;
    return true;
  });

  const waitingList = filteredQueues.filter((q) => q.status === "WAITING" || q.status === "CALLED");
  const inServiceList = filteredQueues.filter((q) => q.status === "IN_SERVICE");
  const completedList = filteredQueues.filter((q) => q.status === "COMPLETED" || q.status === "SKIPPED");

  return (
    <PageContainer>
      <PageHeader
        title="Papan Antrian Poliklinik (Live Queue)"
        description="Kelola panggilan pasien, mulai pemeriksaan, dan koordinasi antrian poli secara real-time."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchQueues} className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Segarkan
            </Button>
            <Link href={ROUTES.QUEUES.DISPLAY}>
              <Button variant="outline" size="sm" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50">
                <Tv className="h-3.5 w-3.5 mr-1.5" />
                Layar Antrian TV
              </Button>
            </Link>
            <Link href={ROUTES.REGISTRATIONS.NEW}>
              <Button size="sm" className="text-xs font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ambil Nomor Antrian
              </Button>
            </Link>
          </div>
        }
      />

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          variant={selectedDepartment === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDepartment("ALL")}
          className="text-xs rounded-full"
        >
          Semua Poliklinik ({queues.length})
        </Button>
        {departments.map((dept) => {
          const count = queues.filter((q) => q.departmentName === dept).length;
          return (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
              className="text-xs rounded-full"
            >
              {dept} ({count})
            </Button>
          );
        })}
      </div>

      {/* 3 Column Kanban Board: Waiting -> In Service -> Completed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Menunggu & Dipanggil */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-900 uppercase">Menunggu / Dipanggil</span>
            <Badge variant="warning" className="text-xs">{waitingList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Tidak ada antrian menunggu
              </div>
            ) : (
              waitingList.map((q) => (
                <Card key={q.id} className="shadow-xs border-slate-200 hover:border-blue-300 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-blue-600 font-mono">{q.queueNumber}</span>
                      <StatusBadge status={q.status} type="queue" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">{q.patientName}</p>
                      <p className="text-xs text-slate-500 font-mono">{q.patientMrNumber} • {q.payerType}</p>
                      <p className="text-xs text-slate-700 mt-1">{q.departmentName} — {q.doctorName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallAudio(q)}
                        className="text-xs h-8 flex-1 text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                      >
                        <Volume2 className="h-3.5 w-3.5 mr-1" />
                        Panggil
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(q.id, "IN_SERVICE", "mulai periksa")}
                        className="text-xs h-8 flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Periksa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(q.id, "SKIPPED", "lewati")}
                        className="text-xs h-8 px-2 text-slate-500"
                        title="Lewati"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Sedang Dalam Pemeriksaan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-900 uppercase">Sedang Diperiksa</span>
            <Badge variant="default" className="text-xs">{inServiceList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {inServiceList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Tidak ada pasien sedang diperiksa
              </div>
            ) : (
              inServiceList.map((q) => (
                <Card key={q.id} className="shadow-xs border-blue-200 bg-blue-50/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold text-blue-700 font-mono">{q.queueNumber}</span>
                      <StatusBadge status={q.status} type="queue" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">{q.patientName}</p>
                      <p className="text-xs text-slate-500">{q.departmentName} • {q.doctorName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <Link href={ROUTES.VISITS.LIST} className="flex-1">
                        <Button size="sm" variant="default" className="w-full text-xs h-8 font-semibold">
                          <Stethoscope className="h-3.5 w-3.5 mr-1" />
                          Buka SOAP Rekam Medis
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(q.id, "COMPLETED", "selesaikan")}
                        className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Selesai
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Selesai / Dilewati */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase">Selesai / Dilewati</span>
            <Badge variant="secondary" className="text-xs">{completedList.length}</Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {completedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                Belum ada antrian selesai
              </div>
            ) : (
              completedList.slice(0, 8).map((q) => (
                <Card key={q.id} className="shadow-xs border-slate-200 opacity-80">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700 text-sm">{q.queueNumber}</span>
                      <StatusBadge status={q.status} type="queue" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 truncate">{q.patientName}</p>
                    <p className="text-[11px] text-slate-500">{q.departmentName}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
`);

// 4. TV Queue Display (/queue-display)
writeFile("src/app/(dashboard)/queue-display/page.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { useQueueStore } from "@/stores/queueStore";
import { queueService } from "@/services";
import { Queue } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Building2, ArrowLeft, Clock, Activity, BellRing } from "lucide-react";
import { MOCK_CLINIC_PROFILE } from "@/mocks";

export default function QueueDisplayTVPage() {
  const { queues, setQueues } = useQueueStore();
  const [currentTime, setCurrentTime] = React.useState("");
  const [currentCalled, setCurrentCalled] = React.useState<Queue | null>(null);

  React.useEffect(() => {
    async function load() {
      const list = await queueService.getAll();
      setQueues(list);
    }
    load();

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);

    return () => clearInterval(timer);
  }, [setQueues]);

  // Determine current active / called queue
  React.useEffect(() => {
    const called = queues.find((q) => q.status === "CALLED" || q.status === "IN_SERVICE");
    if (called) setCurrentCalled(called);
  }, [queues]);

  const waitingList = queues.filter((q) => q.status === "WAITING");
  const inServiceList = queues.filter((q) => q.status === "IN_SERVICE");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top TV Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">{MOCK_CLINIC_PROFILE.name}</h1>
            <p className="text-xs text-blue-400 font-medium">Layar Pemanggilan Antrian Poliklinik Terpadu</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="font-mono text-base font-bold text-white tracking-widest">{currentTime || "08:00:00"}</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 animate-pulse">
            SISTEM LIVE
          </Badge>
        </div>
      </header>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6">
        {/* Left: Giant Currently Called Queue */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 p-8 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <BellRing className="h-3.5 w-3.5 animate-bounce" />
              PANGGILAN AKTIF
            </div>

            <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-blue-300">
              NOMOR ANTRIAN SAAT INI
            </p>

            <div className="my-6">
              <span className="text-7xl sm:text-9xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
                {currentCalled ? currentCalled.queueNumber : "---"}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                {currentCalled ? currentCalled.departmentName : "Menunggu Antrian Berikutnya"}
              </h3>
              <p className="text-base text-slate-300 font-medium">
                {currentCalled ? \`Dokter: \${currentCalled.doctorName}\` : "-"}
              </p>
              <p className="text-sm text-slate-400">
                {currentCalled ? \`Pasien: \${currentCalled.patientName}\` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Department Overview & Next Queues */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sedang Diperiksa di Ruangan</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {inServiceList.slice(0, 4).map((q) => (
                <div key={q.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{q.departmentName}</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{q.queueNumber}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 truncate max-w-[80px]">{q.patientName.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Antrian Berikutnya (Menunggu)</span>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                {waitingList.length} Pasien
              </Badge>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {waitingList.slice(0, 5).map((q) => (
                <div key={q.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400 text-sm bg-amber-400/10 px-2 py-0.5 rounded">
                      {q.queueNumber}
                    </span>
                    <span className="font-medium text-slate-200">{q.patientName}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{q.departmentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TV Running Text Footer */}
      <footer className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Info: Mohon persiapkan KTP / Kartu BPJS saat nomor dipanggil ke ruangan periksa.</span>
        </div>
        <span>{MOCK_CLINIC_PROFILE.city} • Pelayanan Medis Paripurna</span>
      </footer>
    </div>
  );
}
`);

// 5. Visits List (/visits)
writeFile("src/app/(dashboard)/visits/page.tsx", `
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Visit } from "@/types";
import { visitService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Stethoscope, Eye, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const list = await visitService.getAll();
        setVisits(list);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const columns: ColumnDef<Visit>[] = [
    {
      accessorKey: "queueNumber",
      header: "Antrian",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          {row.getValue("queueNumber")}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div>
            <Link href={ROUTES.PATIENTS.DETAIL(v.patientId)} className="font-semibold text-slate-900 hover:text-blue-600">
              {v.patientName}
            </Link>
            <p className="text-xs text-slate-500 font-mono">{v.patientMrNumber} • {v.patientAge} thn</p>
          </div>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Poliklinik",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-800">{row.getValue("departmentName")}</span>,
    },
    {
      accessorKey: "doctorName",
      header: "Dokter",
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.getValue("doctorName")}</span>,
    },
    {
      accessorKey: "primaryDiagnosis",
      header: "Diagnosa Utama",
      cell: ({ row }) => <span className="text-xs font-medium text-slate-900">{row.getValue("primaryDiagnosis") || "-"}</span>,
    },
    {
      accessorKey: "payerType",
      header: "Penjamin",
      cell: ({ row }) => {
        const p = row.original.payerType;
        const cfg = PAYER_CONFIG[p] || { label: p, badgeVariant: "outline" };
        return <Badge variant={cfg.badgeVariant as any} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="visit" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <Link href={ROUTES.VISITS.DETAIL(v.id)}>
            <Button size="sm" variant="default" className="text-xs h-8 font-semibold shadow-xs">
              <Stethoscope className="h-3.5 w-3.5 mr-1" />
              Periksa (SOAP)
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Kunjungan & Pemeriksaan Medis"
        description="Pencatatan pemeriksaan fisik (SOAP), vital signs, diagnosis ICD, tindakan, dan resep obat."
        actions={
          <Link href={ROUTES.REGISTRATIONS.NEW}>
            <Button size="sm" className="font-semibold shadow-xs">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Pendaftaran Baru
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={visits}
        searchKey="patientName"
        searchPlaceholder="Cari nama pasien atau diagnosa..."
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
`);

// 6. Medical Examination SOAP Form (/visits/[id])
writeFile("src/app/(dashboard)/visits/[id]/page.tsx", `
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { visitExaminationSchema, VisitExaminationFormValues } from "@/schemas";
import { Visit, Medicine, PrescriptionItem } from "@/types";
import { visitService, medicineService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormInput, FormTextarea } from "@/components/forms/FormControls";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowLeft, Save, Plus, Trash2, Pill, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { formatCurrency, generateId } from "@/lib/utils";

export default function VisitExaminationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [visit, setVisit] = React.useState<Visit | null>(null);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [prescriptionItems, setPrescriptionItems] = React.useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Prescription Item inputs
  const [selectedMedId, setSelectedMedId] = React.useState("");
  const [dosage, setDosage] = React.useState("1 tablet");
  const [frequency, setFrequency] = React.useState("3 x sehari 1 tablet");
  const [quantity, setQuantity] = React.useState(10);
  const [instructions, setInstructions] = React.useState("Diminum sesudah makan");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VisitExaminationFormValues>({
    resolver: zodResolver(visitExaminationSchema),
  });

  React.useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [v, meds] = await Promise.all([
          visitService.getById(id),
          medicineService.getAll(),
        ]);
        setVisit(v);
        setMedicines(meds);

        if (v) {
          setValue("complaint", v.complaint || "");
          setValue("historyOfPresentIllness", v.historyOfPresentIllness || "");
          setValue("pastMedicalHistory", v.pastMedicalHistory || "");
          setValue("allergy", v.allergy || "");
          setValue("bloodPressure", v.vitalSigns?.bloodPressure || "120/80");
          setValue("temperature", v.vitalSigns?.temperature || 36.5);
          setValue("pulse", v.vitalSigns?.pulse || 80);
          setValue("respiration", v.vitalSigns?.respiration || 18);
          setValue("spo2", v.vitalSigns?.spo2 || 99);
          setValue("weight", v.vitalSigns?.weight || 60);
          setValue("height", v.vitalSigns?.height || 165);
          setValue("primaryDiagnosis", v.primaryDiagnosis || "");
          setValue("secondaryDiagnosis", v.secondaryDiagnosis || "");
          setValue("treatment", v.treatment || "");
          setValue("notes", v.notes || "");
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id, setValue]);

  const handleAddMedicine = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) {
      toast.error("Pilih obat terlebih dahulu.");
      return;
    }

    const newItem: PrescriptionItem = {
      id: generateId("rxi"),
      medicineId: med.id,
      medicineName: med.name,
      dosage: dosage,
      frequency: frequency,
      quantity: Number(quantity),
      unit: med.unit,
      instructions: instructions,
      price: med.sellingPrice,
    };

    setPrescriptionItems([...prescriptionItems, newItem]);
    setSelectedMedId("");
    toast.success(\`\${med.name} ditambahkan ke resep.\`);
  };

  const handleRemoveMedicine = (itemId: string) => {
    setPrescriptionItems(prescriptionItems.filter((i) => i.id !== itemId));
  };

  const onSubmit = async (values: VisitExaminationFormValues) => {
    try {
      setIsSubmitting(true);
      await visitService.saveExamination(id, {
        ...values,
        vitalSigns: {
          bloodPressure: values.bloodPressure,
          temperature: Number(values.temperature),
          pulse: Number(values.pulse),
          respiration: Number(values.respiration),
          spo2: Number(values.spo2),
          weight: Number(values.weight),
          height: Number(values.height),
        },
        prescriptionItems: prescriptionItems,
      });

      toast.success("Hasil pemeriksaan SOAP dan resep berhasil disimpan!");
      router.push(ROUTES.VISITS.LIST);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pemeriksaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageContainer><LoadingState title="Memuat lembar pemeriksaan SOAP..." /></PageContainer>;
  if (!visit) return <PageContainer><ErrorState title="Kunjungan tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer maxWidth="lg">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href={ROUTES.VISITS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar Kunjungan
        </Link>
        <StatusBadge status={visit.status} type="visit" />
      </div>

      {/* Patient & Visit Header Card */}
      <Card className="shadow-xs bg-slate-900 text-white border-0">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                {visit.queueNumber}
              </span>
              <h2 className="text-xl font-bold text-white">{visit.patientName}</h2>
              <span className="text-xs text-slate-400 font-mono">({visit.patientMrNumber})</span>
            </div>
            <p className="text-xs text-slate-300">
              {visit.patientGender === "MALE" ? "Laki-laki" : "Perempuan"} • {visit.patientAge} Tahun • Penjamin: {visit.payerType}
            </p>
          </div>
          <div className="text-right sm:text-right">
            <p className="text-xs text-blue-400 font-semibold">{visit.departmentName}</p>
            <p className="text-xs text-slate-300 font-medium">{visit.doctorName}</p>
          </div>
        </CardContent>
      </Card>

      {/* SOAP Examination Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Subjective (S) */}
        <Card className="shadow-xs border-l-4 border-l-blue-600">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">
              S — Subjective (Anamnesis & Keluhan)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">Keluhan utama, riwayat penyakit sekarang, riwayat alergi.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <FormTextarea
              label="Keluhan Utama (Chief Complaint)"
              required
              error={errors.complaint?.message}
              {...register("complaint")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label="Riwayat Penyakit Sekarang (RPS)"
                placeholder="Onset, kualitas, frekuensi, faktor memperberat..."
                error={errors.historyOfPresentIllness?.message}
                {...register("historyOfPresentIllness")}
              />
              <FormTextarea
                label="Riwayat Penyakit Dahulu & Alergi"
                placeholder="Hipertensi, DM, Alergi obat..."
                error={errors.pastMedicalHistory?.message}
                {...register("pastMedicalHistory")}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Objective (O) */}
        <Card className="shadow-xs border-l-4 border-l-emerald-600">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">
              O — Objective (Tanda Vital & Pemeriksaan Fisik)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormInput
              label="Tekanan Darah (mmHg)"
              required
              placeholder="120/80"
              error={errors.bloodPressure?.message}
              {...register("bloodPressure")}
            />
            <FormInput
              label="Suhu Tubuh (°C)"
              type="number"
              step="0.1"
              required
              error={errors.temperature?.message}
              {...register("temperature", { valueAsNumber: true })}
            />
            <FormInput
              label="Denyut Nadi (x/mnt)"
              type="number"
              required
              error={errors.pulse?.message}
              {...register("pulse", { valueAsNumber: true })}
            />
            <FormInput
              label="Laju Pernapasan (x/mnt)"
              type="number"
              required
              error={errors.respiration?.message}
              {...register("respiration", { valueAsNumber: true })}
            />
            <FormInput
              label="Saturasi SpO2 (%)"
              type="number"
              required
              error={errors.spo2?.message}
              {...register("spo2", { valueAsNumber: true })}
            />
            <FormInput
              label="Berat Badan (kg)"
              type="number"
              step="0.5"
              required
              error={errors.weight?.message}
              {...register("weight", { valueAsNumber: true })}
            />
            <FormInput
              label="Tinggi Badan (cm)"
              type="number"
              required
              error={errors.height?.message}
              {...register("height", { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        {/* 3. Assessment (A) */}
        <Card className="shadow-xs border-l-4 border-l-amber-600">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">
              A — Assessment (Diagnosa Medis)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Diagnosa Utama (Primary Diagnosis) *"
              required
              placeholder="Cth: Febris H-3 ec Suspect DHF"
              error={errors.primaryDiagnosis?.message}
              {...register("primaryDiagnosis")}
            />
            <FormInput
              label="Diagnosa Sekunder / Komorbid (Secondary Diagnosis)"
              placeholder="Cth: Hipertensi Stage 1"
              error={errors.secondaryDiagnosis?.message}
              {...register("secondaryDiagnosis")}
            />
          </CardContent>
        </Card>

        {/* 4. Plan (P) & Prescription Editor */}
        <Card className="shadow-xs border-l-4 border-l-purple-600">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">
              P — Plan (Tindakan Medis & Resep Obat)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <FormTextarea
              label="Tindakan / Terapi / Edukasi Pasien *"
              required
              placeholder="Cth: Tirah baring, hidrasi oral > 2.5L/hari, kompres hangat..."
              error={errors.treatment?.message}
              {...register("treatment")}
            />

            {/* Electronic Prescription Editor */}
            <div className="rounded-lg border border-purple-200 bg-purple-50/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-purple-600" />
                  Resep Obat Elektronik (E-Prescription)
                </span>
                <span className="text-xs text-purple-700">{prescriptionItems.length} Obat Ditambahkan</span>
              </div>

              {/* Add item bar */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end bg-white p-3 rounded-md border border-purple-100">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Pilih Obat</label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    className="w-full h-8 text-xs rounded border border-slate-300 bg-white px-2"
                  >
                    <option value="">-- Cari Obat di Katalog --</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.currentStock === 0}>
                        {m.name} (Stok: {m.currentStock} {m.unit}) {m.currentStock <= m.minimumStock ? "⚠️ STOK MENIPIS" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Signa / Aturan</label>
                  <input
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full h-8 text-xs rounded border border-slate-300 px-2"
                    placeholder="3 x 1 tab"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-8 text-xs rounded border border-slate-300 px-2"
                  />
                </div>
                <Button type="button" size="sm" onClick={handleAddMedicine} className="h-8 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah
                </Button>
              </div>

              {/* Prescription Items List */}
              {prescriptionItems.length > 0 ? (
                <div className="divide-y divide-purple-100 bg-white rounded-md border border-purple-200 overflow-hidden">
                  {prescriptionItems.map((item, idx) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{idx + 1}. {item.medicineName}</span>
                        <p className="text-[11px] text-slate-500">{item.quantity} {item.unit} • {item.frequency} • {item.instructions}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedicine(item.id)}
                          className="h-7 w-7 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-2">
                  Belum ada obat yang dimasukkan ke dalam resep.
                </p>
              )}
            </div>

            <FormTextarea
              label="Catatan Dokter / Rencana Kontrol Lanjutan"
              placeholder="Cth: Kontrol kembali jika dalam 3 hari panas tidak turun..."
              error={errors.notes?.message}
              {...register("notes")}
            />
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Link href={ROUTES.VISITS.LIST}>
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-md px-6 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Menyimpan SOAP..." : "Simpan SOAP & Teruskan ke Farmasi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageContainer>
  );
}
`);

// 7. Medical Records List (/medical-records) & Detail (/medical-records/[id])
writeFile("src/app/(dashboard)/medical-records/page.tsx", `
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
import { Eye, FileText } from "lucide-react";
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
`);

writeFile("src/app/(dashboard)/medical-records/[id]/page.tsx", `
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MedicalRecord } from "@/types";
import { medicalRecordService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DetailCard, DetailRow } from "@/components/common/Displays";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function MedicalRecordDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [record, setRecord] = React.useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const rec = await medicalRecordService.getById(id);
        setRecord(rec);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat rekam medis..." /></PageContainer>;
  if (!record) return <PageContainer><ErrorState title="Rekam medis tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer maxWidth="lg">
      <div className="flex items-center justify-between no-print">
        <Link href={ROUTES.MEDICAL_RECORDS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Rekam Medis
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Ringkasan Medis (A4)
        </Button>
      </div>

      <div className="a4-document space-y-6">
        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">RINGKASAN REKAM MEDIS ELEKTRONIK</h1>
            <p className="text-xs text-slate-500">Klinik Pratama Sehat Bersama • Rekam Medis Standar Kemenkes RI</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-blue-600">{record.patientMrNumber}</p>
            <p className="text-xs text-slate-500">{formatDate(record.date, "dd MMMM yyyy")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-slate-500">Nama Pasien: <strong className="text-slate-900">{record.patientName}</strong></p>
            <p className="text-slate-500">Poliklinik: <strong className="text-slate-900">{record.departmentName}</strong></p>
          </div>
          <div>
            <p className="text-slate-500">Dokter Pemeriksa: <strong className="text-slate-900">{record.doctorName}</strong></p>
            <p className="text-slate-500">Tanggal Pemeriksaan: <strong className="text-slate-900">{formatDate(record.date)}</strong></p>
          </div>
        </div>

        <DetailCard title="1. Anamnesis (Subjective)">
          <DetailRow label="Keluhan Utama" value={record.complaint} />
        </DetailCard>

        <DetailCard title="2. Pemeriksaan Fisik & Tanda Vital (Objective)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Tekanan Darah</span>
              <strong className="text-slate-900">{record.vitalSigns.bloodPressure} mmHg</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Suhu Tubuh</span>
              <strong className="text-slate-900">{record.vitalSigns.temperature} °C</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Denyut Nadi</span>
              <strong className="text-slate-900">{record.vitalSigns.pulse} x/menit</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">SpO2</span>
              <strong className="text-slate-900">{record.vitalSigns.spo2} %</strong>
            </div>
          </div>
        </DetailCard>

        <DetailCard title="3. Diagnosa Klinis (Assessment)">
          <DetailRow label="Diagnosa Utama" value={<strong className="text-blue-700">{record.primaryDiagnosis}</strong>} />
          {record.secondaryDiagnosis && <DetailRow label="Diagnosa Sekunder" value={record.secondaryDiagnosis} />}
        </DetailCard>

        <DetailCard title="4. Penatalaksanaan (Plan)">
          <DetailRow label="Tindakan & Terapi" value={record.treatment} />
          {record.prescriptionSummary && <DetailRow label="Resep Obat" value={record.prescriptionSummary} />}
          {record.notes && <DetailRow label="Catatan Tambahan" value={record.notes} />}
        </DetailCard>
      </div>
    </PageContainer>
  );
}
`);

console.log("Finished generating Milestone C part 2.");
