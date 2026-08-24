"use client";

import * as React from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { PatientForm } from "@/features/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Pendaftaran Pasien Baru"
        description="Formulir pencatatan rekam medis pasien baru untuk integrasi layanan poliklinik."
      />
      <PatientForm mode="create" />
    </PageContainer>
  );
}
