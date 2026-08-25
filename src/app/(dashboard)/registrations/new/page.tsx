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
        title="Ambil Nomor Antrian (Walk-in)"
        description="Untuk pasien yang datang langsung ke loket. Data pasien langsung diteruskan ke perawat."
      />
      <React.Suspense fallback={<LoadingState title="Memuat form pendaftaran..." />}>
        <RegistrationForm
          cancelHref={ROUTES.REGISTRATIONS.LIST}
          continueHref={ROUTES.QUEUES.LIST}
          continueLabel="Lanjut ke Papan Antrian"
          source="STAFF"
          createVisitImmediately
        />
      </React.Suspense>
    </PageContainer>
  );
}
