"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorExaminationSchema, DoctorExaminationFormValues } from "@/schemas";
import { Visit, Medicine, PrescriptionItem } from "@/types";
import { visitService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/forms/FormControls";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Save, Plus, Trash2, Pill } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { formatCurrency, generateId } from "@/lib/utils";

export function DoctorExaminationForm({ visit, medicines }: { visit: Visit; medicines: Medicine[] }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [prescriptionItems, setPrescriptionItems] = React.useState<PrescriptionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [selectedMedId, setSelectedMedId] = React.useState("");
  const [dosage] = React.useState("1 tablet");
  const [frequency, setFrequency] = React.useState("3 x sehari 1 tablet");
  const [quantity, setQuantity] = React.useState(10);
  const [instructions] = React.useState("Diminum sesudah makan");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DoctorExaminationFormValues>({
    resolver: zodResolver(doctorExaminationSchema),
    defaultValues: {
      anamnesis: "",
      examination: "",
      primaryDiagnosis: "",
      secondaryDiagnosis: "",
      treatment: "",
      doctorNotes: "",
      needsFollowUp: false,
      followUpInstruction: "",
    },
  });

  const needsFollowUp = watch("needsFollowUp");

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
      dosage,
      frequency,
      quantity: Number(quantity),
      unit: med.unit,
      instructions,
      price: med.sellingPrice,
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setSelectedMedId("");
    toast.success(`${med.name} ditambahkan ke resep.`);
  };

  const handleRemoveMedicine = (itemId: string) => {
    setPrescriptionItems(prescriptionItems.filter((i) => i.id !== itemId));
  };

  const onSubmit = async (values: DoctorExaminationFormValues) => {
    try {
      setIsSubmitting(true);
      await visitService.saveDoctorExamination(
        visit.id,
        { ...values, prescriptionItems },
        user?.name || "Dokter"
      );
      toast.success("Pemeriksaan tersimpan — kunjungan diteruskan ke tindak lanjut perawat.");
      router.push(ROUTES.VISITS.LIST);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pemeriksaan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="shadow-xs border-l-4 border-l-blue-600">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Anamnesis & Pemeriksaan</CardTitle>
          <CardDescription className="text-xs text-slate-500">Keluhan &amp; tanda vital dari perawat sudah tercatat di atas — lengkapi hasil pemeriksaan dokter.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormTextarea label="Anamnesis Tambahan (Opsional)" placeholder="Riwayat, onset, faktor pemberat..." error={errors.anamnesis?.message} {...register("anamnesis")} />
          <FormTextarea label="Pemeriksaan Fisik (Opsional)" placeholder="Temuan pemeriksaan fisik..." error={errors.examination?.message} {...register("examination")} />
        </CardContent>
      </Card>

      <Card className="shadow-xs border-l-4 border-l-amber-600">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Diagnosa</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Diagnosa Utama" required placeholder="Cth: Febris H-3 ec Suspect DHF" error={errors.primaryDiagnosis?.message} {...register("primaryDiagnosis")} />
          <FormInput label="Diagnosa Sekunder / Komorbid" placeholder="Cth: Hipertensi Stage 1" error={errors.secondaryDiagnosis?.message} {...register("secondaryDiagnosis")} />
        </CardContent>
      </Card>

      <Card className="shadow-xs border-l-4 border-l-purple-600">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Tindakan, Resep & Tindak Lanjut</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <FormTextarea label="Tindakan / Terapi / Edukasi Pasien" required placeholder="Cth: Tirah baring, hidrasi oral > 2.5L/hari..." error={errors.treatment?.message} {...register("treatment")} />

          <div className="rounded-lg border border-purple-200 bg-purple-50/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                <Pill className="h-4 w-4 text-purple-600" />
                Resep Obat Elektronik (E-Prescription)
              </span>
              <span className="text-xs text-purple-700">{prescriptionItems.length} Obat Ditambahkan</span>
            </div>

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
                <input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full h-8 text-xs rounded border border-slate-300 px-2" placeholder="3 x 1 tab" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Jumlah</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full h-8 text-xs rounded border border-slate-300 px-2" />
              </div>
              <Button type="button" size="sm" onClick={handleAddMedicine} className="h-8 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Tambah
              </Button>
            </div>

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
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMedicine(item.id)} className="h-7 w-7 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-2">Tidak ada obat — kunjungan akan langsung diteruskan ke kasir (tanpa farmasi).</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="needsFollowUp" checked={needsFollowUp} onCheckedChange={(v) => setValue("needsFollowUp", v === true)} />
              <Label htmlFor="needsFollowUp" className="text-xs font-semibold text-slate-700">
                Pasien perlu kontrol / kunjungan ulang
              </Label>
            </div>
            {needsFollowUp && (
              <FormTextarea label="Instruksi Tindak Lanjut" placeholder="Cth: Kontrol 3 hari lagi jika belum membaik" {...register("followUpInstruction")} />
            )}
          </div>

          <FormTextarea label="Catatan Dokter (Opsional)" placeholder="Catatan tambahan untuk rekam medis..." error={errors.doctorNotes?.message} {...register("doctorNotes")} />
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-md px-6 bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Menyimpan..." : "Simpan Pemeriksaan"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
