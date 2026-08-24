"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicineSchema, MedicineFormValues } from "@/schemas";
import { Medicine } from "@/types";
import { medicineService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/forms/FormControls";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface MedicineFormProps {
  mode: "create" | "edit";
  initialData?: Medicine;
}

export function MedicineForm({ mode, initialData }: MedicineFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          name: initialData.name,
          genericName: initialData.genericName,
          category: initialData.category,
          unit: initialData.unit,
          manufacturer: initialData.manufacturer,
          purchasePrice: initialData.purchasePrice,
          sellingPrice: initialData.sellingPrice,
          minimumStock: initialData.minimumStock,
          currentStock: initialData.currentStock,
          description: initialData.description || "",
          status: initialData.status,
        }
      : {
          code: "",
          name: "",
          genericName: "",
          category: "Analgesik & Antipiretik",
          unit: "Tablet",
          manufacturer: "",
          purchasePrice: 1000,
          sellingPrice: 2000,
          minimumStock: 50,
          currentStock: 100,
          description: "",
          status: "ACTIVE",
        },
  });

  const categoryValue = watch("category");
  const unitValue = watch("unit");

  const onSubmit = async (values: MedicineFormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === "create") {
        const newMed = await medicineService.create(values);
        toast.success(`Obat ${newMed.name} berhasil ditambahkan.`);
        router.push(ROUTES.MEDICINES.DETAIL(newMed.id));
      } else if (mode === "edit" && initialData) {
        await medicineService.update(initialData.id, values);
        toast.success("Data obat berhasil diperbarui.");
        router.push(ROUTES.MEDICINES.DETAIL(initialData.id));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan data obat.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.MEDICINES.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Katalog Obat
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.MEDICINES.LIST}>
            <Button type="button" variant="outline" size="sm">Batal</Button>
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold shadow-xs">
            <Save className="h-4 w-4 mr-1.5" />
            {isSubmitting ? "Menyimpan..." : mode === "create" ? "Tambah Obat" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Identitas & Informasi Obat</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Kode Obat"
            required
            placeholder="Cth: MED-PCT500"
            error={errors.code?.message}
            {...register("code")}
          />
          <FormInput
            label="Nama Dagang Obat"
            required
            placeholder="Cth: Paracetamol 500 mg"
            error={errors.name?.message}
            {...register("name")}
          />
          <FormInput
            label="Nama Generik / Zat Aktif"
            required
            placeholder="Cth: Paracetamol"
            error={errors.genericName?.message}
            {...register("genericName")}
          />
          <FormInput
            label="Pabrik / Produsen Farmasi"
            required
            placeholder="Cth: PT Kimia Farma"
            error={errors.manufacturer?.message}
            {...register("manufacturer")}
          />

          <FormSelect
            label="Kategori Obat"
            required
            value={categoryValue}
            onValueChange={(val) => setValue("category", val)}
            options={[
              { label: "Analgesik & Antipiretik", value: "Analgesik & Antipiretik" },
              { label: "Antibiotik", value: "Antibiotik" },
              { label: "Antihipertensi", value: "Antihipertensi" },
              { label: "Antidiabetes", value: "Antidiabetes" },
              { label: "Antasida & Saluran Cerna", value: "Antasida & Saluran Cerna" },
              { label: "Antihistamin & Alergi", value: "Antihistamin & Alergi" },
              { label: "Vitamin & Suplemen", value: "Vitamin & Suplemen" },
            ]}
          />

          <FormSelect
            label="Satuan Obat (Unit)"
            required
            value={unitValue}
            onValueChange={(val) => setValue("unit", val)}
            options={[
              { label: "Tablet", value: "Tablet" },
              { label: "Kaplet", value: "Kaplet" },
              { label: "Kapsul", value: "Kapsul" },
              { label: "Botol (Sirup/Suspensi)", value: "Botol" },
              { label: "Sachet", value: "Sachet" },
              { label: "Ampul / Vial (Injeksi)", value: "Ampul" },
              { label: "Tube (Salep)", value: "Tube" },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Harga & Batas Stok</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FormInput
            label="Harga Beli (Rp)"
            type="number"
            required
            error={errors.purchasePrice?.message}
            {...register("purchasePrice", { valueAsNumber: true })}
          />
          <FormInput
            label="Harga Jual (Rp)"
            type="number"
            required
            error={errors.sellingPrice?.message}
            {...register("sellingPrice", { valueAsNumber: true })}
          />
          <FormInput
            label="Batas Minimum Stok"
            type="number"
            required
            error={errors.minimumStock?.message}
            {...register("minimumStock", { valueAsNumber: true })}
          />
          <FormInput
            label="Stok Awal"
            type="number"
            required
            error={errors.currentStock?.message}
            {...register("currentStock", { valueAsNumber: true })}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href={ROUTES.MEDICINES.LIST}>
          <Button type="button" variant="outline">Batal</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-xs">
          <Save className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Tambah Obat" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
