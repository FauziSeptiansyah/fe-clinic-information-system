"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormValues } from "@/schemas";
import { Patient, Gender, BloodType, PayerType } from "@/types";
import { patientService } from "@/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface PatientFormProps {
  mode: "create" | "edit";
  initialData?: Patient;
}

export function PatientForm({ mode, initialData }: PatientFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when this form is opened from another flow (e.g. reception identifying a kiosk
  // patient) that needs to resume with the newly-created patient instead of landing on
  // the patient detail page.
  const returnTo = searchParams.get("returnTo");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          nickname: initialData.nickname || "",
          nik: initialData.nik,
          birthPlace: initialData.birthPlace,
          birthDate: initialData.birthDate,
          gender: initialData.gender,
          bloodType: initialData.bloodType,
          phone: initialData.phone,
          email: initialData.email || "",
          address: initialData.address,
          province: initialData.province,
          city: initialData.city,
          district: initialData.district,
          village: initialData.village,
          postalCode: initialData.postalCode,
          allergy: initialData.allergy || "",
          specialNotes: initialData.specialNotes || "",
          payer: initialData.payer,
          insuranceNumber: initialData.insuranceNumber || "",
          company: initialData.company || "",
          sepNumber: initialData.sepNumber || "",
          faskes1: initialData.faskes1 || "",
          referralType: initialData.referralType || "",
          status: initialData.status,
        }
      : {
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
          allergy: "",
          specialNotes: "",
          payer: "GENERAL",
          insuranceNumber: "",
          company: "",
          sepNumber: "",
          faskes1: "",
          referralType: "",
          status: "ACTIVE",
        },
  });

  const payerValue = watch("payer");
  const genderValue = watch("gender");
  const bloodTypeValue = watch("bloodType");

  const onSubmit = async (values: PatientFormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === "create") {
        const newPatient = await patientService.create(values);
        toast.success(`Pasien ${newPatient.fullName} berhasil didaftarkan.`);
        if (returnTo) {
          router.push(`${returnTo}?patientId=${newPatient.id}`);
        } else {
          router.push(ROUTES.PATIENTS.DETAIL(newPatient.id));
        }
      } else if (mode === "edit" && initialData) {
        await patientService.update(initialData.id, values);
        toast.success("Data pasien berhasil diperbarui.");
        router.push(ROUTES.PATIENTS.DETAIL(initialData.id));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan data pasien.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.PATIENTS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Data Pasien
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.PATIENTS.LIST}>
            <Button type="button" variant="outline" size="sm">Batal</Button>
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold shadow-xs">
            <Save className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Menyimpan..." : mode === "create" ? "Daftarkan Pasien" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* 1. Informasi Identitas Pasien */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">1. Informasi Identitas Pribadi</CardTitle>
          <CardDescription className="text-xs text-slate-500">Data identitas resmi sesuai KTP / Dokumen Kependudukan.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nama Lengkap Pasien"
            required
            placeholder="Cth: Ahmad Rizky Pratama"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <FormInput
            label="Nama Panggilan / Alias"
            placeholder="Cth: Rizky"
            error={errors.nickname?.message}
            {...register("nickname")}
          />
          <FormInput
            label="NIK (Nomor Induk Kependudukan 16 Digit)"
            required
            maxLength={16}
            placeholder="Cth: 3171012304850001"
            error={errors.nik?.message}
            {...register("nik")}
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Tempat Lahir"
              required
              placeholder="Cth: Jakarta"
              error={errors.birthPlace?.message}
              {...register("birthPlace")}
            />
            <FormInput
              label="Tanggal Lahir"
              type="date"
              required
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />
          </div>

          <FormSelect
            label="Jenis Kelamin"
            required
            value={genderValue}
            onValueChange={(val) => setValue("gender", val as Gender)}
            options={[
              { label: "Laki-laki (Male)", value: "MALE" },
              { label: "Perempuan (Female)", value: "FEMALE" },
            ]}
          />

          <FormSelect
            label="Golongan Darah"
            value={bloodTypeValue}
            onValueChange={(val) => setValue("bloodType", val as BloodType)}
            options={[
              { label: "Belum Tahu / Tidak Dicatat (-)", value: "-" },
              { label: "A", value: "A" },
              { label: "B", value: "B" },
              { label: "AB", value: "AB" },
              { label: "O", value: "O" },
            ]}
          />
        </CardContent>
      </Card>

      {/* 2. Kontak & Alamat */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">2. Kontak & Alamat Domisili</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nomor Telepon / WhatsApp"
              required
              placeholder="Cth: 081298765432"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <FormInput
              label="Email (Opsional)"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <FormTextarea
            label="Alamat Lengkap (Jalan, RT/RW, No. Rumah)"
            required
            placeholder="Cth: Jl. Melawai IX No. 20, RT 02 / RW 04"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormInput label="Provinsi" required error={errors.province?.message} {...register("province")} />
            <FormInput label="Kota / Kab" required error={errors.city?.message} {...register("city")} />
            <FormInput label="Kecamatan" required error={errors.district?.message} {...register("district")} />
            <FormInput label="Kelurahan / Desa" required error={errors.village?.message} {...register("village")} />
          </div>
          <div className="w-full sm:w-1/4">
            <FormInput label="Kode Pos" required maxLength={5} error={errors.postalCode?.message} {...register("postalCode")} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Penjamin & Asuransi (Termasuk BPJS) */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">3. Penjamin & Asuransi</CardTitle>
          <CardDescription className="text-xs text-slate-500">Pilih skema pembiayaan pengobatan pasien.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Jenis Penjamin (Payer)"
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
            {payerValue !== "GENERAL" && (
              <FormInput
                label="Nomor Kartu / Polis Asuransi"
                placeholder="Cth: 0001234567891"
                error={errors.insuranceNumber?.message}
                {...register("insuranceNumber")}
              />
            )}
          </div>

          {payerValue === "BPJS" && (
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput
                label="Nomor SEP (Surat Eligibilitas Peserta)"
                placeholder="Cth: SEP-20260824-0012"
                error={errors.sepNumber?.message}
                {...register("sepNumber")}
              />
              <FormInput
                label="Faskes Tingkat 1 Rujukan"
                placeholder="Cth: Puskesmas Kebayoran"
                error={errors.faskes1?.message}
                {...register("faskes1")}
              />
              <FormInput
                label="Jenis Rujukan"
                placeholder="Cth: Faskes 1 Mandiri / Vertikal"
                error={errors.referralType?.message}
                {...register("referralType")}
              />
            </div>
          )}

          {payerValue === "CORPORATE" && (
            <FormInput
              label="Nama Perusahaan Penjamin"
              placeholder="Cth: PT Telkom Indonesia"
              error={errors.company?.message}
              {...register("company")}
            />
          )}
        </CardContent>
      </Card>

      {/* 4. Riwayat Medis & Catatan Khusus */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">4. Alergi & Catatan Medis Khusus</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Riwayat Alergi Obat / Makanan"
            placeholder="Cth: Amoxicillin, Paracetamol, Udang, Debu"
            error={errors.allergy?.message}
            {...register("allergy")}
          />
          <FormInput
            label="Catatan Khusus / Riwayat Penyakit Kronis"
            placeholder="Cth: Hipertensi, DM Tipe 2, Asma"
            error={errors.specialNotes?.message}
            {...register("specialNotes")}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Link href={ROUTES.PATIENTS.LIST}>
          <Button type="button" variant="outline">Batal</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-sm px-6">
          <Save className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Daftarkan Pasien" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
