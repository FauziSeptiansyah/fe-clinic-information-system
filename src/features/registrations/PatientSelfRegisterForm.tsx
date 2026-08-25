"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSelfRegisterSchema, PatientSelfRegisterFormValues } from "@/schemas";
import { Patient } from "@/types";
import { patientService } from "@/services";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { saveSelfRegisteredPatient } from "@/lib/selfRegisteredPatients";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface PatientSelfRegisterFormProps {
  /** Called after the account is created and the patient is auto-logged-in. */
  onSuccess: (patient: Patient) => void;
}

export function PatientSelfRegisterForm({ onSuccess }: PatientSelfRegisterFormProps) {
  const loginPatient = usePatientAuthStore((s) => s.loginPatient);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
      onSuccess(newPatient);
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

      <Button type="submit" disabled={isSubmitting} className="w-full font-semibold shadow-xs">
        <UserPlus className="h-4 w-4 mr-1.5" />
        {isSubmitting ? "Membuat Akun..." : "Daftar"}
      </Button>
    </form>
  );
}
