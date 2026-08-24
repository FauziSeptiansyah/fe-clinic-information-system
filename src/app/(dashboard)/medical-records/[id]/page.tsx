"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MedicalRecord } from "@/types";
import { medicalRecordService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DetailCard, DetailRow } from "@/components/common/Displays";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export default function MedicalRecordDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [record, setRecord] = React.useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const rec = await medicalRecordService.getById(id);
        setRecord(rec);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (isLoading) return <PageContainer><LoadingState title="Memuat rekam medis..." /></PageContainer>;
  if (!record) return <PageContainer><ErrorState title="Rekam medis tidak ditemukan" /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between no-print">
        <Link href={ROUTES.MEDICAL_RECORDS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Rekam Medis
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Cetak Ringkasan Medis (A4)
        </Button>
      </div>

      <div className="a4-document space-y-6">
        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">RINGKASAN REKAM MEDIS ELEKTRONIK</h1>
            <p className="text-xs text-slate-500">Klinik Pratama Sehat Bersama • Rekam Medis Standar Kemenkes RI</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-blue-600">{record.patientMrNumber}</p>
            <p className="text-xs text-slate-500">{formatDate(record.date, "dd MMMM yyyy")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md">
          <div>
            <p className="text-slate-500">Nama Pasien: <strong className="text-slate-900">{record.patientName}</strong></p>
            <p className="text-slate-500">Poliklinik: <strong className="text-slate-900">{record.departmentName}</strong></p>
          </div>
          <div>
            <p className="text-slate-500">Dokter Pemeriksa: <strong className="text-slate-900">{record.doctorName}</strong></p>
            <p className="text-slate-500">Tanggal Pemeriksaan: <strong className="text-slate-900">{formatDate(record.date)}</strong></p>
          </div>
        </div>

        <DetailCard title="1. Anamnesis (Subjective)">
          <DetailRow label="Keluhan Utama" value={record.complaint} />
        </DetailCard>

        <DetailCard title="2. Pemeriksaan Fisik & Tanda Vital (Objective)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Tekanan Darah</span>
              <strong className="text-slate-900">{record.vitalSigns.bloodPressure} mmHg</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Suhu Tubuh</span>
              <strong className="text-slate-900">{record.vitalSigns.temperature} °C</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">Denyut Nadi</span>
              <strong className="text-slate-900">{record.vitalSigns.pulse} x/menit</strong>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border">
              <span className="text-slate-500 block">SpO2</span>
              <strong className="text-slate-900">{record.vitalSigns.spo2} %</strong>
            </div>
          </div>
        </DetailCard>

        <DetailCard title="3. Diagnosa Klinis (Assessment)">
          <DetailRow label="Diagnosa Utama" value={<strong className="text-blue-700">{record.primaryDiagnosis}</strong>} />
          {record.secondaryDiagnosis && <DetailRow label="Diagnosa Sekunder" value={record.secondaryDiagnosis} />}
        </DetailCard>

        <DetailCard title="4. Penatalaksanaan (Plan)">
          <DetailRow label="Tindakan & Terapi" value={record.treatment} />
          {record.prescriptionSummary && <DetailRow label="Resep Obat" value={record.prescriptionSummary} />}
          {record.notes && <DetailRow label="Catatan Tambahan" value={record.notes} />}
        </DetailCard>
      </div>
    </PageContainer>
  );
}
