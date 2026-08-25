"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Patient, Visit, MedicalRecord, Prescription, Invoice } from "@/types";
import { patientService, visitService, medicalRecordService, prescriptionService, billingService } from "@/services";
import { PageContainer } from "@/components/common/PageContainer";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DetailCard, DetailRow, CurrencyDisplay } from "@/components/common/Displays";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, UserPlus, ArrowLeft, AlertCircle } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { PAYER_CONFIG } from "@/config/statusConfig";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [medicalRecords, setMedicalRecords] = React.useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [p, vs, mrs, rxs, invs] = await Promise.all([
          patientService.getById(id),
          visitService.getAll(),
          medicalRecordService.getByPatientId(id),
          prescriptionService.getAll(),
          billingService.getAll(),
        ]);
        setPatient(p);
        setVisits(vs.filter((v) => v.patientId === id));
        setMedicalRecords(mrs);
        setPrescriptions(rxs.filter((r) => r.patientId === id));
        setInvoices(invs.filter((i) => i.patientId === id));
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Memuat data rekam medis pasien..." />
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer>
        <ErrorState
          title="Pasien Tidak Ditemukan"
          description="Data pasien dengan ID tersebut tidak tersedia dalam basis data."
          onRetry={() => router.push(ROUTES.PATIENTS.LIST)}
        />
      </PageContainer>
    );
  }

  const age = calculateAge(patient.birthDate);
  const payerCfg = PAYER_CONFIG[patient.payer] || { label: patient.payer, badgeVariant: "outline" };

  return (
    <PageContainer>
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link href={ROUTES.PATIENTS.LIST} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Data Pasien
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.PATIENTS.EDIT(patient.id)}>
            <Button variant="outline" size="sm">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Ubah Data
            </Button>
          </Link>
          <Link href={`${ROUTES.REGISTRATIONS.NEW}?patientId=${patient.id}`}>
            <Button size="sm" className="font-semibold shadow-xs">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Daftarkan Berobat
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <Card className="shadow-xs border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shrink-0 border-2 border-blue-200">
                {patient.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.fullName}</h1>
                  <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                    {patient.mrNumber}
                  </Badge>
                  <StatusBadge status={patient.status} />
                </div>
                <p className="text-xs text-slate-500">
                  {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {age} Tahun ({formatDate(patient.birthDate, "dd MMMM yyyy")}) • NIK: <span className="font-mono">{patient.nik}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant={payerCfg.badgeVariant} className="text-xs">{payerCfg.label}</Badge>
                  {patient.allergy && (
                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Alergi: {patient.allergy}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="overview">Ringkasan Profil</TabsTrigger>
          <TabsTrigger value="visits">Riwayat Kunjungan ({visits.length})</TabsTrigger>
          <TabsTrigger value="medical-records">Rekam Medis ({medicalRecords.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Resep Obat ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="billing">Tagihan & Kasir ({invoices.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailCard title="Informasi Identitas & Domisili">
              <DetailRow label="Nama Lengkap" value={patient.fullName} />
              <DetailRow label="Nama Panggilan" value={patient.nickname || "-"} />
              <DetailRow label="Tempat, Tanggal Lahir" value={`${patient.birthPlace}, ${formatDate(patient.birthDate)}`} />
              <DetailRow label="Golongan Darah" value={patient.bloodType} />
              <DetailRow label="Nomor Telepon" value={patient.phone} />
              <DetailRow label="Email" value={patient.email || "-"} />
              <DetailRow label="Alamat Domisili" value={`${patient.address}, ${patient.village}, ${patient.district}, ${patient.city}, ${patient.province} ${patient.postalCode}`} />
            </DetailCard>

            <DetailCard title="Informasi Penjamin & Asuransi">
              <DetailRow label="Jenis Penjamin" value={<Badge variant={payerCfg.badgeVariant}>{payerCfg.label}</Badge>} />
              {patient.insuranceNumber && <DetailRow label="Nomor Polis / Kartu" value={<span className="font-mono">{patient.insuranceNumber}</span>} />}
              {patient.sepNumber && <DetailRow label="Nomor SEP BPJS" value={<span className="font-mono">{patient.sepNumber}</span>} />}
              {patient.faskes1 && <DetailRow label="Faskes Tingkat 1" value={patient.faskes1} />}
              {patient.referralType && <DetailRow label="Jenis Rujukan" value={patient.referralType} />}
              {patient.company && <DetailRow label="Perusahaan Penjamin" value={patient.company} />}
              <DetailRow label="Alergi Pasien" value={<span className="text-red-600 font-semibold">{patient.allergy || "Tidak ada alergi tercatat"}</span>} />
              <DetailRow label="Catatan Khusus" value={patient.specialNotes || "-"} />
            </DetailCard>
          </div>
        </TabsContent>

        {/* Tab 2: Visits */}
        <TabsContent value="visits">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {visits.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada riwayat kunjungan.</div>
              ) : (
                visits.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(v.registrationDate, "dd MMMM yyyy")} • {v.departmentName}</p>
                      <p className="text-xs text-slate-500">Dokter: {v.doctorName} • Keluhan: {v.nurseAssessment?.complaint || "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={v.status} type="visit" />
                      <Link href={ROUTES.VISITS.DETAIL(v.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Kunjungan</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Medical Records Timeline */}
        <TabsContent value="medical-records">
          <div className="space-y-4">
            {medicalRecords.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-xs text-slate-500">Belum ada rekam medis tersimpan.</CardContent></Card>
            ) : (
              medicalRecords.map((mr) => (
                <Card key={mr.id} className="shadow-xs border-l-4 border-l-blue-600">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">{formatDate(mr.date, "EEEE, dd MMMM yyyy")}</span>
                      <span className="text-xs text-slate-500">{mr.doctorName} • {mr.departmentName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Keluhan Pasien (Subjective):</p>
                        <p className="text-slate-600 mt-0.5">{mr.complaint}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Tanda Vital (Objective):</p>
                        <p className="text-slate-600 mt-0.5">
                          TD: {mr.vitalSigns.bloodPressure} mmHg | Suhu: {mr.vitalSigns.temperature}°C | Nadi: {mr.vitalSigns.pulse}x/m
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Diagnosa (Assessment):</p>
                        <p className="text-slate-900 font-semibold mt-0.5">{mr.primaryDiagnosis}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 uppercase tracking-wide">Tindakan & Terapi (Plan):</p>
                        <p className="text-slate-600 mt-0.5">{mr.treatment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Prescriptions */}
        <TabsContent value="prescriptions">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada resep obat tercatat.</div>
              ) : (
                prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rx.prescriptionNumber} • {formatDate(rx.createdAt)}</p>
                      <p className="text-xs text-slate-500">Item: {rx.items.map((i) => `${i.medicineName} (${i.quantity} ${i.unit})`).join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rx.status} type="prescription" />
                      <Link href={ROUTES.PRESCRIPTIONS.DETAIL(rx.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Resep</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Billing */}
        <TabsContent value="billing">
          <Card className="shadow-xs">
            <CardContent className="p-0 divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Belum ada riwayat tagihan.</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{inv.invoiceNumber} • {formatDate(inv.createdAt)}</p>
                      <p className="text-xs text-slate-500">Total: <CurrencyDisplay amount={inv.grandTotal} /> • Sisa: <CurrencyDisplay amount={inv.remainingAmount} /></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inv.status} type="invoice" />
                      <Link href={ROUTES.BILLING.DETAIL(inv.id)}>
                        <Button size="sm" variant="outline" className="text-xs h-8">Lihat Tagihan</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
