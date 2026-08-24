"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSelfRegisterSchema, PatientSelfRegisterFormValues } from "@/schemas";
import { Gender, BloodType, PayerType } from "@/types";
import { patientService } from "@/services";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { saveSelfRegisteredPatient } from "@/lib/selfRegisteredPatients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { UserPlus } from "lucide-react";

export function PatientSelfRegisterForm() {
  const router = useRouter();
  const loginPatient = usePatientAuthStore((s) => s.loginPatient);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientSelfRegisterFormValues>({
    resolver: zodResolver(patientSelfRegisterSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      nik: "",
      birthPlace: "",
      birthDate: "",
      gender: "MALE",
      bloodType: "-",
      phone: "",
      email: "",
      address: "",
      province: "DKI Jakarta",
      city: "Jakarta Selatan",
      district: "Kebayoran Baru",
      village: "Melawai",
      postalCode: "12160",
      payer: "GENERAL",
      status: "ACTIVE",
      password: "",
      confirmPassword: "",
    },
  });

  const genderValue = watch("gender");
  const payerValue = watch("payer");

  const onSubmit = async (values: PatientSelfRegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...patientData } = values;
    void _confirmPassword;
    try {
      setIsSubmitting(true);
      const newPatient = await patientService.create({ ...patientData, bloodType: patientData.bloodType as BloodType });
      saveSelfRegisteredPatient(newPatient);
      loginPatient(newPatient);
      toast.success(`Akun berhasil dibuat. Selamat datang, ${newPatient.fullName}!`);
      router.push(ROUTES.PUBLIC.TAKE_QUEUE);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun pasien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Identitas Pasien</CardTitle>
          <CardDescription className="text-xs text-slate-500">Data identitas resmi sesuai KTP / Dokumen Kependudukan.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Nama Lengkap" required placeholder="Cth: Ahmad Rizky Pratama" error={errors.fullName?.message} {...register("fullName")} />
          <FormInput label="NIK (16 Digit)" required maxLength={16} placeholder="Cth: 3171012304850001" error={errors.nik?.message} {...register("nik")} />
          <FormInput label="Tempat Lahir" required placeholder="Cth: Jakarta" error={errors.birthPlace?.message} {...register("birthPlace")} />
          <FormInput label="Tanggal Lahir" type="date" required error={errors.birthDate?.message} {...register("birthDate")} />
          <FormSelect
            label="Jenis Kelamin"
            required
            value={genderValue}
            onValueChange={(val) => setValue("gender", val as Gender)}
            options={[
              { label: "Laki-laki", value: "MALE" },
              { label: "Perempuan", value: "FEMALE" },
            ]}
          />
          <FormInput label="Nomor HP / WhatsApp" required placeholder="Cth: 081298765432" error={errors.phone?.message} {...register("phone")} />
          <FormInput label="Email" type="email" required placeholder="nama@email.com" helperText="Dipakai untuk login." error={errors.email?.message} {...register("email")} />
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Alamat & Penjamin</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <FormInput label="Alamat Lengkap" required placeholder="Cth: Jl. Melawai IX No. 20, RT 02 / RW 04" error={errors.address?.message} {...register("address")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormInput label="Provinsi" required error={errors.province?.message} {...register("province")} />
            <FormInput label="Kota / Kab" required error={errors.city?.message} {...register("city")} />
            <FormInput label="Kecamatan" required error={errors.district?.message} {...register("district")} />
            <FormInput label="Kode Pos" required maxLength={5} error={errors.postalCode?.message} {...register("postalCode")} />
          </div>
          <FormSelect
            label="Penjamin Biaya"
            required
            value={payerValue}
            onValueChange={(val) => setValue("payer", val as PayerType)}
            options={[
              { label: "Umum / Bayar Mandiri", value: "GENERAL" },
              { label: "BPJS Kesehatan", value: "BPJS" },
              { label: "Asuransi Swasta", value: "INSURANCE" },
              { label: "Perusahaan / Corporate", value: "CORPORATE" },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Buat Akun Pasien</CardTitle>
          <CardDescription className="text-xs text-slate-500">Dipakai untuk masuk kembali saat ambil antrian di lain waktu.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Kata Sandi" type="password" required placeholder="Minimal 6 karakter" error={errors.password?.message} {...register("password")} />
          <FormInput label="Konfirmasi Kata Sandi" type="password" required placeholder="Ulangi kata sandi" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link href={ROUTES.PUBLIC.LOGIN} className="text-blue-600 font-semibold hover:underline">
            Login di sini
          </Link>
        </p>
        <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Membuat Akun..." : "Daftar & Lanjut Ambil Antrian"}
        </Button>
      </div>
    </form>
  );
}
