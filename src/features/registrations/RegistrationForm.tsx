"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  patientService,
  doctorService,
  masterService,
  queueService,
  visitService,
} from "@/services";
import { Patient, Doctor, Department, Service, Queue, PayerType, QueueSource } from "@/types";
import { useQueueStore } from "@/stores/queueStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { Search, UserCheck, Ticket, Printer, Building2, Stethoscope, Check } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/Displays";

interface RegistrationFormProps {
  /** Where "Batal" navigates to. */
  cancelHref: string;
  /** Where the success dialog's continue button/close action navigates to. */
  continueHref: string;
  /** Label for the success dialog's continue button. */
  continueLabel: string;
  /** Whether to show the "+ Pasien Baru Belum Terdaftar" shortcut (links to the staff intake page). */
  allowNewPatient?: boolean;
  /** When set, Step 1 is locked to this patient (no search, no switching identity) — used for a logged-in patient's own self-service flow. */
  fixedPatient?: Patient;
  /** Where this queue number is being taken from. */
  source: QueueSource;
  /**
   * Staff at the front desk identify the patient at the same moment they take the number, so
   * a Visit is created immediately (skipping the separate reception "receive" step). A patient
   * taking a number online is NOT at the front desk, so this stays false — only a bare Queue
   * entry is created, and reception creates the Visit later once they receive it.
   */
  createVisitImmediately?: boolean;
}

export function RegistrationForm({
  cancelHref,
  continueHref,
  continueLabel,
  allowNewPatient = true,
  fixedPatient,
  source,
  createVisitImmediately = false,
}: RegistrationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const addQueueToStore = useQueueStore((s) => s.addQueue);

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(fixedPatient ?? null);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("");
  const [selectedServiceId, setSelectedServiceId] = React.useState("");
  const [payerType, setPayerType] = React.useState<"GENERAL" | "BPJS" | "INSURANCE" | "CORPORATE">(fixedPatient?.payer ?? "GENERAL");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Success Ticket Modal State
  const [registeredQueue, setRegisteredQueue] = React.useState<Queue | null>(null);

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

      if (!fixedPatient && preselectedPatientId) {
        const found = pts.find((p) => p.id === preselectedPatientId);
        if (found) {
          setSelectedPatient(found);
          setPayerType(found.payer);
        }
      }
    }
    load();
  }, [preselectedPatientId, fixedPatient]);

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
    toast.success(`Pasien terpilih: ${p.fullName}`);
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

    try {
      setIsSubmitting(true);
      const queue = await queueService.createQueue({
        source,
        patientId: selectedPatient.id,
        departmentId: selectedDepartmentId,
        doctorId: selectedDoctorId,
        serviceId: selectedServiceId,
        payerType,
      });

      if (createVisitImmediately) {
        await visitService.createFromQueue(queue.id, selectedPatient.id);
      }

      setRegisteredQueue(queue);
      toast.success(`Nomor antrian dibuat: ${queue.queueNumber}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal melakukan pendaftaran.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToContinue = () => {
    // Sync the new queue into the shared store only once the user has actually seen and
    // dismissed the ticket — doing it earlier can cause a page that reactively shows
    // "you have an active queue" (like the patient's own queue page) to swap views out
    // from under the still-open ticket dialog.
    if (registeredQueue) addQueueToStore(registeredQueue);
    setRegisteredQueue(null);
    router.push(continueHref);
  };

  return (
    <>
      {/* Step Progress Indicator */}
      <div className="flex items-center gap-2 sm:gap-4">
        {[
          { label: "Pilih Pasien", icon: UserCheck, done: !!selectedPatient },
          { label: "Poliklinik & Layanan", icon: Stethoscope, done: !!selectedDoctorId && !!selectedServiceId },
        ].map((step, i, arr) => (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                  step.done
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-400"
                )}
              >
                {step.done ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-xs font-semibold hidden sm:inline", step.done ? "text-slate-900" : "text-slate-400")}>
                {step.label}
              </span>
            </div>
            {i < arr.length - 1 && <div className={cn("h-0.5 flex-1 rounded", step.done ? "bg-blue-600" : "bg-slate-200")} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Step 1: Patient Selection */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                {fixedPatient ? "Langkah 1: Data Pasien" : "Langkah 1: Pilih Pasien"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {fixedPatient ? "Anda sedang masuk sebagai pasien berikut." : "Cari berdasarkan Nama, Nomor Rekam Medis (RM), atau NIK."}
              </CardDescription>
            </div>
            {allowNewPatient && (
              <Link href={ROUTES.PATIENTS.NEW}>
                <Button type="button" variant="outline" size="sm" className="text-xs text-blue-600 border-blue-200">
                  + Pasien Baru Belum Terdaftar
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {selectedPatient ? (
              <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedPatient.fullName} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedPatient.fullName}</p>
                    <p className="text-xs text-slate-600">
                      No RM: <span className="font-mono font-bold text-blue-700">{selectedPatient.mrNumber}</span> • NIK: {selectedPatient.nik} • Penjamin: {selectedPatient.payer}
                    </p>
                  </div>
                </div>
                {!fixedPatient && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="text-xs text-slate-500 hover:text-red-600">
                    Ganti Pasien
                  </Button>
                )}
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
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar name={p.fullName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{p.fullName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{p.mrNumber} • NIK: {p.nik} • HP: {p.phone}</p>
                          </div>
                        </div>
                        <Button type="button" size="sm" variant="outline" className="h-7 text-xs shrink-0">Pilih</Button>
                      </div>
                    ))
                  )}
                </div>

                {!allowNewPatient && (
                  <p className="text-[11px] text-slate-400">
                    Belum terdaftar sebagai pasien? Silakan datang langsung ke loket pendaftaran klinik atau hubungi resepsionis.
                  </p>
                )}
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
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Penjamin Biaya Kunjungan</Label>
              <Select value={payerType} onValueChange={(val) => setPayerType(val as PayerType)}>
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
          </CardContent>
          <CardFooter className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Link href={cancelHref}>
              <Button type="button" variant="outline" size="sm">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
              <Ticket className="h-4 w-4 mr-1.5" />
              {isSubmitting ? "Memproses..." : "Ambil Nomor Antrian"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Success Antrian Ticket Modal (Supports 80mm Print) */}
      <Dialog open={!!registeredQueue} onOpenChange={goToContinue}>
        <DialogContent className="max-w-sm p-0 text-center overflow-hidden [&>button]:text-white [&>button]:opacity-80 [&>button:hover]:opacity-100">
          <div className="no-print bg-gradient-to-br from-blue-600 to-blue-800 text-white py-5 flex flex-col items-center gap-1.5">
            <div className="h-11 w-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-blue-100">Pendaftaran Berhasil</p>
          </div>
          <div className="thermal-receipt space-y-3 p-6">
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

          <DialogFooter className="no-print flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
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
              onClick={goToContinue}
              className="w-full text-xs font-semibold"
            >
              {continueLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
