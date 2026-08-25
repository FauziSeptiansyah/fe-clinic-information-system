"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { followUpSchema, FollowUpFormValues } from "@/schemas";
import { Visit } from "@/types";
import { visitService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/forms/FormControls";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ArrowRight, Pill } from "lucide-react";

export function FollowUpForm({ visit }: { visit: Visit }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const hasPrescription = !!visit.prescriptionId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      hasFollowUp: visit.doctorExamination?.needsFollowUp || false,
      followUpDate: "",
      instruction: visit.doctorExamination?.followUpInstruction || "",
    },
  });

  const hasFollowUp = watch("hasFollowUp");

  const onSubmit = async (values: FollowUpFormValues) => {
    try {
      setIsSubmitting(true);
      await visitService.saveFollowUp(visit.id, values, user?.name || "Perawat");
      toast.success(
        hasPrescription ? `${visit.patientName} diteruskan ke farmasi.` : `${visit.patientName} diteruskan ke kasir.`
      );
      router.push(ROUTES.NURSE.LIST);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan tindak lanjut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Tindak Lanjut Perawat</CardTitle>
          <CardDescription className="text-xs text-slate-500">Konfirmasi instruksi dokter sebelum kunjungan diteruskan.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-purple-600" />
              Apakah pasien mendapatkan resep obat?
            </span>
            <Badge variant={hasPrescription ? "success" : "secondary"} className="text-[10px]">
              {hasPrescription ? "Ya, ada resep" : "Tidak ada resep"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="hasFollowUp" checked={hasFollowUp} onCheckedChange={(v) => setValue("hasFollowUp", v === true)} />
            <Label htmlFor="hasFollowUp" className="text-xs font-semibold text-slate-700">
              Pasien perlu kunjungan / kontrol ulang
            </Label>
          </div>

          {hasFollowUp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-1">
              <FormInput label="Tanggal Kontrol Ulang" type="date" error={errors.followUpDate?.message} {...register("followUpDate")} />
              <FormTextarea label="Instruksi Tindak Lanjut" placeholder="Cth: Kontrol 3 hari lagi jika belum membaik" {...register("instruction")} />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
            {isSubmitting ? "Menyimpan..." : hasPrescription ? "Teruskan ke Farmasi" : "Teruskan ke Kasir"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
