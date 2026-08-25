"use client";

import * as React from "react";
import { doctorService, masterService, queueService } from "@/services";
import { Doctor, Department, Service, Queue, PayerType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ticket, Printer, Building2, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function KioskQueueForm() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);

  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState("");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState("");
  const [selectedServiceId, setSelectedServiceId] = React.useState("");
  const [payerType, setPayerType] = React.useState<PayerType>("GENERAL");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ticket, setTicket] = React.useState<Queue | null>(null);

  React.useEffect(() => {
    Promise.all([masterService.getDepartments(), doctorService.getAll(), masterService.getServices()]).then(
      ([depts, docs, srvs]) => {
        setDepartments(depts);
        setDoctors(docs);
        setServices(srvs);
      }
    );
  }, []);

  const filteredDoctors = selectedDepartmentId ? doctors.filter((d) => d.departmentId === selectedDepartmentId) : doctors;
  const filteredServices = selectedDepartmentId
    ? services.filter((s) => s.departmentId === selectedDepartmentId || !s.departmentId)
    : services;

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setSelectedDoctorId("");
    setSelectedServiceId("");
  };

  const reset = () => {
    setSelectedDepartmentId("");
    setSelectedDoctorId("");
    setSelectedServiceId("");
    setPayerType("GENERAL");
    setTicket(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId) return toast.error("Silakan pilih poliklinik.");
    if (!selectedDoctorId) return toast.error("Silakan pilih dokter.");
    if (!selectedServiceId) return toast.error("Silakan pilih layanan.");

    try {
      setIsSubmitting(true);
      const queue = await queueService.createQueue({
        source: "KIOSK",
        patientId: null,
        departmentId: selectedDepartmentId,
        doctorId: selectedDoctorId,
        serviceId: selectedServiceId,
        payerType,
      });
      setTicket(queue);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengambil nomor antrian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg">
          <CardHeader className="pb-3 border-b border-slate-100 text-center">
            <CardTitle className="text-xl font-bold text-slate-900">Ambil Nomor Antrean</CardTitle>
            <CardDescription className="text-sm text-slate-500">Pilih poliklinik tujuan Anda di bawah ini.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Poliklinik Tujuan</Label>
              <Select value={selectedDepartmentId} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="h-12 text-sm">
                  <SelectValue placeholder="Pilih Poliklinik..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Dokter</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} disabled={!selectedDepartmentId}>
                <SelectTrigger className="h-12 text-sm">
                  <SelectValue placeholder={selectedDepartmentId ? "Pilih Dokter..." : "Pilih poliklinik dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Layanan</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={!selectedDepartmentId}>
                <SelectTrigger className="h-12 text-sm">
                  <SelectValue placeholder={selectedDepartmentId ? "Pilih Layanan..." : "Pilih poliklinik dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id}>{srv.name} ({formatCurrency(srv.price)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Penjamin Biaya</Label>
              <Select value={payerType} onValueChange={(val) => setPayerType(val as PayerType)}>
                <SelectTrigger className="h-12 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">Umum / Bayar Mandiri</SelectItem>
                  <SelectItem value="BPJS">BPJS Kesehatan</SelectItem>
                  <SelectItem value="INSURANCE">Asuransi Swasta</SelectItem>
                  <SelectItem value="CORPORATE">Perusahaan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100">
            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full text-base font-semibold h-14 shadow-sm">
              <Ticket className="h-5 w-5 mr-2" />
              {isSubmitting ? "Memproses..." : "Ambil Nomor Antrian"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={!!ticket} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="max-w-sm p-0 text-center overflow-hidden [&>button]:text-white [&>button]:opacity-80 [&>button:hover]:opacity-100">
          <div className="no-print bg-gradient-to-br from-blue-600 to-blue-800 text-white py-5 flex flex-col items-center gap-1.5">
            <div className="h-11 w-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-blue-100">Silakan Ambil Tiket Anda</p>
          </div>
          <div className="thermal-receipt space-y-3 p-6">
            <div className="text-center border-b border-slate-300 pb-2">
              <h3 className="font-bold text-sm">KLINIK SEHAT PRATAMA</h3>
              <p className="text-[10px] text-slate-500">Jl. Kesehatan Medika No. 88, Jakarta</p>
            </div>
            <div className="py-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">NOMOR ANTRIAN</p>
              <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight my-1">{ticket?.queueNumber}</h1>
              <Badge variant="outline" className="text-xs font-semibold">{ticket?.departmentName}</Badge>
            </div>
            <div className="border-t border-b border-slate-200 py-2 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Dokter:</span>
                <span className="truncate max-w-[160px]">{ticket?.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Layanan:</span>
                <span className="truncate max-w-[160px]">{ticket?.serviceName}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Silakan duduk menunggu panggilan. Petugas akan memanggil nomor Anda untuk melengkapi data.
            </p>
          </div>
          <DialogFooter className="no-print flex-col sm:flex-row gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="w-full text-xs">
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Cetak Tiket
            </Button>
            <Button type="button" size="sm" onClick={reset} className="w-full text-xs font-semibold">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
