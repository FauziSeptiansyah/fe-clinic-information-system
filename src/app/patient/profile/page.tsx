"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/FormControls";
import { UserAvatar, DetailRow } from "@/components/common/Displays";
import { Pencil, Clock } from "lucide-react";
import { toast } from "sonner";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientChangeRequestService } from "@/services";
import { PatientChangeRequest } from "@/types";

export default function PatientProfilePage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const [pendingRequest, setPendingRequest] = React.useState<PatientChangeRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [fullName, setFullName] = React.useState(patient?.fullName || "");
  const [email, setEmail] = React.useState(patient?.email || "");
  const [phone, setPhone] = React.useState(patient?.phone || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const patientId = patient?.id;

  React.useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    patientChangeRequestService.getPendingForPatient(patientId).then((found) => {
      if (cancelled) return;
      setPendingRequest(found);
      setIsLoadingRequest(false);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const loadPending = async () => {
    if (!patient) return;
    const found = await patientChangeRequestService.getPendingForPatient(patient.id);
    setPendingRequest(found);
  };

  if (!patient) return null;

  const openDialog = () => {
    setFullName(patient.fullName);
    setEmail(patient.email || "");
    setPhone(patient.phone);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Nama dan nomor HP wajib diisi.");
      return;
    }
    try {
      setIsSubmitting(true);
      await patientChangeRequestService.create({
        patientId: patient.id,
        patientName: patient.fullName,
        patientMrNumber: patient.mrNumber,
        currentValues: { fullName: patient.fullName, email: patient.email || "", phone: patient.phone },
        requestedValues: { fullName, email, phone },
      });
      toast.success("Permintaan perubahan data diajukan. Menunggu konfirmasi dari resepsionis/CS.");
      setDialogOpen(false);
      loadPending();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengajukan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Data dasar akun Anda.</p>
      </div>

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <UserAvatar name={patient.fullName} size="lg" />
          <div>
            <p className="text-sm font-bold text-slate-900">{patient.fullName}</p>
            <p className="text-xs text-slate-500">No RM: <span className="font-mono font-semibold">{patient.mrNumber}</span></p>
          </div>
        </CardContent>
      </Card>

      {!isLoadingRequest && pendingRequest && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Clock className="h-3.5 w-3.5" />
              Menunggu Konfirmasi CS
              <Badge variant="warning" className="text-[10px]">PENDING</Badge>
            </div>
            <p className="text-xs text-amber-700">
              Anda mengajukan perubahan: <strong>{pendingRequest.requestedValues.fullName}</strong>,{" "}
              {pendingRequest.requestedValues.email}, {pendingRequest.requestedValues.phone}. Data akan berubah setelah
              dikonfirmasi oleh resepsionis/CS klinik.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Data Dasar</CardTitle>
            <CardDescription className="text-xs text-slate-500">Nama, email, dan nomor HP yang terdaftar.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
            disabled={!!pendingRequest}
            onClick={openDialog}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Ajukan Perubahan
          </Button>
        </CardHeader>
        <CardContent className="p-5 space-y-0">
          <DetailRow label="Nama Lengkap" value={patient.fullName} />
          <DetailRow label="Email" value={patient.email || "-"} />
          <DetailRow label="Nomor HP" value={patient.phone} />
        </CardContent>
      </Card>

      <p className="text-[11px] text-slate-400 text-center px-4">
        Data pribadi tidak bisa diubah langsung — perubahan perlu dikonfirmasi oleh staf klinik untuk menjaga keakuratan
        rekam medis Anda.
      </p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Perubahan Data</DialogTitle>
            <DialogDescription>
              Perubahan akan diterapkan setelah dikonfirmasi oleh resepsionis/CS klinik.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Nama Lengkap" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormInput label="Nomor HP" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold shadow-xs">
                {isSubmitting ? "Mengajukan..." : "Ajukan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
