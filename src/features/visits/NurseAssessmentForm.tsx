"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nurseAssessmentSchema, NurseAssessmentFormValues } from "@/schemas";
import { Visit } from "@/types";
import { visitService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ClipboardCheck } from "lucide-react";

export function NurseAssessmentForm({ visit }: { visit: Visit }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NurseAssessmentFormValues>({
    resolver: zodResolver(nurseAssessmentSchema),
    defaultValues: {
      complaint: "",
      weight: 60,
      height: 165,
      bloodPressure: "120/80",
      temperature: 36.5,
      pulse: 80,
      respiration: 18,
      medicalHistory: "",
      allergyHistory: "",
      currentMedications: "",
      nurseNotes: "",
    },
  });

  const onSubmit = async (values: NurseAssessmentFormValues) => {
    try {
      setIsSubmitting(true);
      await visitService.saveNurseAssessment(visit.id, values, user?.name || "Perawat");
      toast.success(`Triase selesai — ${visit.patientName} diteruskan ke dokter.`);
      router.push(ROUTES.NURSE.LIST);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pemeriksaan awal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Pemeriksaan Awal (Triase)</CardTitle>
          <CardDescription className="text-xs text-slate-500">Catat keluhan dan tanda vital sebelum diteruskan ke dokter.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <FormTextarea
            label="Keluhan Utama"
            required
            placeholder="Cth: Demam 3 hari, batuk pilek, sakit kepala..."
            error={errors.complaint?.message}
            {...register("complaint")}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormInput label="Berat Badan (kg)" type="number" step="0.1" required error={errors.weight?.message} {...register("weight", { valueAsNumber: true })} />
            <FormInput label="Tinggi Badan (cm)" type="number" required error={errors.height?.message} {...register("height", { valueAsNumber: true })} />
            <FormInput label="Tekanan Darah" placeholder="120/80" required error={errors.bloodPressure?.message} {...register("bloodPressure")} />
            <FormInput label="Suhu (°C)" type="number" step="0.1" required error={errors.temperature?.message} {...register("temperature", { valueAsNumber: true })} />
            <FormInput label="Nadi (x/mnt)" type="number" required error={errors.pulse?.message} {...register("pulse", { valueAsNumber: true })} />
            <FormInput label="Respirasi (x/mnt)" type="number" error={errors.respiration?.message} {...register("respiration", { valueAsNumber: true })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Riwayat Penyakit" placeholder="Cth: Hipertensi, DM Tipe 2" {...register("medicalHistory")} />
            <FormInput label="Riwayat Alergi" placeholder="Cth: Amoxicillin, Udang" {...register("allergyHistory")} />
          </div>
          <FormInput label="Obat yang Sedang Dikonsumsi" placeholder="Cth: Amlodipine 5mg 1x1" {...register("currentMedications")} />
          <FormTextarea label="Catatan Perawat (Opsional)" placeholder="Catatan tambahan untuk dokter..." {...register("nurseNotes")} />
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
            <ClipboardCheck className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Menyimpan..." : "Selesai Triase — Teruskan ke Dokter"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
