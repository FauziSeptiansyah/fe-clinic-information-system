"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormControls";
import { UserAvatar } from "@/components/common/Displays";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientService } from "@/services";
import { saveSelfRegisteredPatient } from "@/lib/selfRegisteredPatients";

export default function PatientProfilePage() {
  const patient = usePatientAuthStore((s) => s.patient);
  const loginPatient = usePatientAuthStore((s) => s.loginPatient);
  const [fullName, setFullName] = React.useState(patient?.fullName || "");
  const [email, setEmail] = React.useState(patient?.email || "");
  const [phone, setPhone] = React.useState(patient?.phone || "");
  const [isSaving, setIsSaving] = React.useState(false);

  if (!patient) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Nama dan nomor HP wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      const updated = await patientService.update(patient.id, { fullName, email, phone });
      loginPatient(updated);
      saveSelfRegisteredPatient(updated);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola data dasar akun Anda.</p>
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

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Data Dasar</CardTitle>
            <CardDescription className="text-xs text-slate-500">Nama, email, dan nomor HP yang terdaftar.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <FormInput label="Nama Lengkap" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} helperText="Dipakai untuk login." />
            <FormInput label="Nomor HP" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} className="font-semibold shadow-xs">
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
