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
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/forms/FormControls";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ArrowLeft, Save, Plus, Trash2, Pill } from "lucide-react";
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
  const [dosage] = React.useState("1 tablet");
  const [frequency, setFrequency] = React.useState("3 x sehari 1 tablet");
  const [quantity, setQuantity] = React.useState(10);
  const [instructions] = React.useState("Diminum sesudah makan");

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
    toast.success(`${med.name} ditambahkan ke resep.`);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan pemeriksaan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageContainer><LoadingState title="Memuat lembar pemeriksaan SOAP..." /></PageContainer>;
  if (!visit) return <PageContainer><ErrorState title="Kunjungan tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
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
