"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { visitService } from "@/services";
import { Visit } from "@/types";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientSummaryCard, DoctorExaminationSummary } from "@/features/visits/VisitHandoffCards";
import { NurseAssessmentForm } from "@/features/visits/NurseAssessmentForm";
import { FollowUpForm } from "@/features/visits/FollowUpForm";
import { AlertCircle } from "lucide-react";

export default function NurseVisitDetailPage() {
  const params = useParams<{ id: string }>();
  const [visit, setVisit] = React.useState<Visit | null | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    visitService.getById(params.id).then((v) => {
      if (!cancelled) setVisit(v);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (visit === undefined) {
    return (
      <PageContainer>
        <LoadingState title="Memuat kunjungan..." />
      </PageContainer>
    );
  }

  if (!visit) {
    return (
      <PageContainer>
        <EmptyState title="Kunjungan tidak ditemukan" description="Data kunjungan ini tidak tersedia." />
      </PageContainer>
    );
  }

  const isTriageStage = visit.status === "WAITING_NURSE";
  const isFollowUpStage = visit.status === "WAITING_FOLLOW_UP";

  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title={isTriageStage ? "Triase Pasien" : isFollowUpStage ? "Tindak Lanjut Pasien" : "Detail Kunjungan"}
        description={`${visit.patientName} • ${visit.queueNumber}`}
      />

      <PatientSummaryCard visit={visit} />

      {isTriageStage && <NurseAssessmentForm visit={visit} />}

      {isFollowUpStage && (
        <>
          <DoctorExaminationSummary visit={visit} />
          <FollowUpForm visit={visit} />
        </>
      )}

      {!isTriageStage && !isFollowUpStage && (
        <div className="p-6 rounded-lg border border-dashed border-slate-300 flex items-center gap-3 text-sm text-slate-500">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          Kunjungan ini sudah tidak berada di tahap perawat (status saat ini akan ditampilkan lewat badge status pada daftar kunjungan).
        </div>
      )}
    </PageContainer>
  );
}
