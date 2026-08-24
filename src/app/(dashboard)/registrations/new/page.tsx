import * as React from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { RegistrationForm } from "@/features/registrations/RegistrationForm";
import { ROUTES } from "@/config/routes";

export default function NewRegistrationPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Alur Pendaftaran & Ambil Nomor Antrian"
        description="Pilih pasien, poliklinik tujuan, dokter, dan cetak tiket nomor antrian."
      />
      <React.Suspense fallback={<LoadingState title="Memuat form pendaftaran..." />}>
        <RegistrationForm
          cancelHref={ROUTES.REGISTRATIONS.LIST}
          continueHref={ROUTES.QUEUES.LIST}
          continueLabel="Lanjut ke Papan Antrian"
        />
      </React.Suspense>
    </PageContainer>
  );
}
