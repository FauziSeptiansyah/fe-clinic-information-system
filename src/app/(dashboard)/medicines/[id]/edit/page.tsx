"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Medicine } from "@/types";
import { medicineService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { MedicineForm } from "@/features/medicines/MedicineForm";

export default function EditMedicinePage() {
  const params = useParams();
  const id = params.id as string;
  const [medicine, setMedicine] = React.useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const m = await medicineService.getById(id);
        setMedicine(m);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat data obat..." /></PageContainer>;
  if (!medicine) return <PageContainer><p className="text-sm text-slate-500">Obat tidak ditemukan.</p></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        title={`Ubah Data Obat — ${medicine.name}`}
        description={`Perbarui informasi harga dan spesifikasi untuk ${medicine.code}`}
      />
      <MedicineForm mode="edit" initialData={medicine} />
    </PageContainer>
  );
}
