"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { patientService } from "@/services";
import { Patient } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { PatientForm } from "@/features/patients/PatientForm";

export default function EditPatientPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const p = await patientService.getById(id);
        setPatient(p);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Memuat data pasien..." />
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer>
        <p className="text-center text-sm text-slate-500">Pasien tidak ditemukan.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Ubah Data Pasien — ${patient.fullName}`}
        description={`Perbarui informasi biodata, kontak, dan penjamin untuk ${patient.mrNumber}`}
      />
      <PatientForm mode="edit" initialData={patient} />
    </PageContainer>
  );
}
