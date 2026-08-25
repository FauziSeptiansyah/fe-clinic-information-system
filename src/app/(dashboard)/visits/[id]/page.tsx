"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Visit, Medicine } from "@/types";
import { visitService, medicineService } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/config/permissionConfig";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PatientSummaryCard, NurseAssessmentSummary, DoctorExaminationSummary } from "@/features/visits/VisitHandoffCards";
import { DoctorExaminationForm } from "@/features/visits/DoctorExaminationForm";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function VisitExaminationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const role = useAuthStore((s) => s.role);

  const [visit, setVisit] = React.useState<Visit | null>(null);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([visitService.getById(id), medicineService.getAll()]).then(([v, meds]) => {
      if (cancelled) return;
      setVisit(v);
      setMedicines(meds);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat kunjungan..." /></PageContainer>;
  if (!visit) return <PageContainer><ErrorState title="Kunjungan tidak ditemukan" /></PageContainer>;

  const canExamine = hasPermission(role || undefined, "visits.examine");
  const isActionable = visit.status === "WAITING_DOCTOR" && canExamine;

  return (
    <PageContainer maxWidth="md">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.VISITS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Daftar Kunjungan
        </Link>
        <StatusBadge status={visit.status} type="visit" />
      </div>

      <PatientSummaryCard visit={visit} />
      <NurseAssessmentSummary visit={visit} />

      {isActionable ? (
        <DoctorExaminationForm visit={visit} medicines={medicines} />
      ) : visit.doctorExamination ? (
        <DoctorExaminationSummary visit={visit} />
      ) : (
        <Card className="shadow-xs">
          <CardContent className="p-6 flex items-center gap-3 text-sm text-slate-500">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            {visit.status === "WAITING_DOCTOR"
              ? "Kunjungan ini menunggu pemeriksaan dokter."
              : "Kunjungan ini belum sampai di tahap pemeriksaan dokter."}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
