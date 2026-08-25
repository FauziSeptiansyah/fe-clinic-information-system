import { Visit } from "@/types";
import { DetailCard, DetailRow, UserAvatar } from "@/components/common/Displays";
import { Badge } from "@/components/ui/badge";

const SOURCE_LABEL: Record<Visit["source"], string> = {
  ONLINE: "Online",
  KIOSK: "Kiosk",
  STAFF: "Loket",
};

/** Read-only patient + registration snapshot — shown at the top of every downstream stage. */
export function PatientSummaryCard({ visit }: { visit: Visit }) {
  return (
    <DetailCard
      title="Data Pasien & Registrasi"
      description="Data ini sudah dilengkapi tahap sebelumnya — tidak dapat diubah di sini."
      action={<Badge variant="outline" className="text-[10px]">{SOURCE_LABEL[visit.source]}</Badge>}
    >
      <div className="flex items-center gap-3 mb-3">
        <UserAvatar name={visit.patientName} size="lg" />
        <div>
          <p className="text-sm font-bold text-slate-900">{visit.patientName}</p>
          <p className="text-xs text-slate-500 font-mono">{visit.patientMrNumber}</p>
        </div>
      </div>
      <DetailRow label="Jenis Kelamin / Usia" value={`${visit.patientGender === "MALE" ? "Laki-laki" : "Perempuan"} • ${visit.patientAge} th`} />
      <DetailRow label="Poliklinik" value={visit.departmentName} />
      <DetailRow label="Dokter" value={visit.doctorName} />
      <DetailRow label="Layanan" value={visit.serviceName} />
      <DetailRow label="Penjamin" value={visit.payerType} />
    </DetailCard>
  );
}

/** Read-only nurse triage summary — shown on the Doctor's examination page. */
export function NurseAssessmentSummary({ visit }: { visit: Visit }) {
  const a = visit.nurseAssessment;
  if (!a) return null;
  return (
    <DetailCard title="Pemeriksaan Awal Perawat" description={`Dicatat oleh ${a.recordedBy}`}>
      <DetailRow label="Keluhan Utama" value={a.complaint} />
      <DetailRow label="Tanda Vital" value={`TD ${a.bloodPressure} • Suhu ${a.temperature}°C • Nadi ${a.pulse}x/mnt${a.respiration ? ` • RR ${a.respiration}x/mnt` : ""}`} />
      <DetailRow label="BB / TB" value={`${a.weight} kg / ${a.height} cm`} />
      {a.medicalHistory && <DetailRow label="Riwayat Penyakit" value={a.medicalHistory} />}
      {a.allergyHistory && <DetailRow label="Riwayat Alergi" value={a.allergyHistory} />}
      {a.currentMedications && <DetailRow label="Obat yang Dikonsumsi" value={a.currentMedications} />}
      {a.nurseNotes && <DetailRow label="Catatan Perawat" value={a.nurseNotes} />}
    </DetailCard>
  );
}

/** Read-only doctor examination summary — shown on the Nurse follow-up page. */
export function DoctorExaminationSummary({ visit }: { visit: Visit }) {
  const e = visit.doctorExamination;
  if (!e) return null;
  return (
    <DetailCard title="Hasil Pemeriksaan Dokter" description={`Diperiksa oleh ${e.examinedBy}`}>
      <DetailRow label="Diagnosa Utama" value={e.primaryDiagnosis} />
      {e.secondaryDiagnosis && <DetailRow label="Diagnosa Sekunder" value={e.secondaryDiagnosis} />}
      <DetailRow label="Tindakan / Terapi" value={e.treatment} />
      <DetailRow label="Resep Obat" value={e.hasPrescription ? "Ada resep — diteruskan ke farmasi" : "Tidak ada resep"} />
      {e.needsFollowUp && <DetailRow label="Instruksi Tindak Lanjut" value={e.followUpInstruction || "-"} />}
      {e.doctorNotes && <DetailRow label="Catatan Dokter" value={e.doctorNotes} />}
    </DetailCard>
  );
}
