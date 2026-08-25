"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSelfRegisterSchema, PatientSelfRegisterFormValues } from "@/schemas";
import { patientService } from "@/services";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { saveSelfRegisteredPatient } from "@/lib/selfRegisteredPatients";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { UserPlus } from "lucide-react";

export function PatientSelfRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.PATIENT.DASHBOARD;
  const loginPatient = usePatientAuthStore((s) => s.loginPatient);
  const existingPatient = usePatientAuthStore((s) => s.patient);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Already signed in (e.g. arrived here via browser back) — no reason to see this form again.
    if (existingPatient) router.replace(redirectTo);
  }, [existingPatient, redirectTo, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientSelfRegisterFormValues>({
    resolver: zodResolver(patientSelfRegisterSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: PatientSelfRegisterFormValues) => {
    try {
      setIsSubmitting(true);
      // Only identity + login essentials are collected here — the rest of the medical
      // record (NIK, address, payer, ...) is completed later by a receptionist or the
      // patient themself via their profile, matching the Patient type's required shape.
      const newPatient = await patientService.create({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        nickname: "",
        nik: "",
        birthPlace: "",
        birthDate: "",
        gender: "MALE",
        bloodType: "-",
        address: "",
        province: "",
        city: "",
        district: "",
        village: "",
        postalCode: "",
        payer: "GENERAL",
        status: "ACTIVE",
      });
      saveSelfRegisteredPatient(newPatient);
      loginPatient(newPatient);
      toast.success(`Akun berhasil dibuat. Selamat datang, ${newPatient.fullName}!`);
      router.replace(redirectTo);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun pasien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Nama Lengkap" required placeholder="Cth: Ahmad Rizky Pratama" error={errors.fullName?.message} {...register("fullName")} />
      <FormInput label="Email" type="email" required placeholder="nama@email.com" helperText="Dipakai untuk login." error={errors.email?.message} {...register("email")} />
      <FormInput label="Nomor HP / WhatsApp" required placeholder="Cth: 081298765432" error={errors.phone?.message} {...register("phone")} />
      <FormInput label="Kata Sandi" type="password" required placeholder="Minimal 6 karakter" error={errors.password?.message} {...register("password")} />
      <FormInput label="Konfirmasi Kata Sandi" type="password" required placeholder="Ulangi kata sandi" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link href={ROUTES.PUBLIC.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Login di sini
          </Link>
        </p>
        <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Membuat Akun..." : "Daftar"}
        </Button>
      </div>
    </form>
  );
}
