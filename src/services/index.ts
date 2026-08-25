import {
  Patient,
  Doctor,
  Department,
  Service,
  Procedure,
  Payer,
  PayerType,
  QueueSource,
  Queue,
  QueueStatus,
  Visit,
  NurseAssessment,
  MedicalRecord,
  Prescription,
  PrescriptionItem,
  Medicine,
  MedicineBatch,
  StockMovement,
  InventorySummary,
  Supplier,
  Purchase,
  PurchaseItem,
  Invoice,
  InvoiceItem,
  Payment,
  PaymentMethod,
  ClinicProfile,
  AuditLog,
  User,
  Role,
  PrescriptionStatus,
  PatientChangeRequest,
} from "@/types";
import {
  MOCK_CLINIC_PROFILE,
  MOCK_DEPARTMENTS,
  MOCK_SERVICES,
  MOCK_PROCEDURES,
  MOCK_PAYERS,
  MOCK_DOCTORS,
  MOCK_PATIENTS,
  MOCK_MEDICINES,
  MOCK_BATCHES,
  MOCK_STOCK_MOVEMENTS,
  MOCK_SUPPLIERS,
  MOCK_PURCHASES,
  MOCK_QUEUES,
  MOCK_VISITS,
  MOCK_MEDICAL_RECORDS,
  MOCK_PRESCRIPTIONS,
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_AUDIT_LOGS,
} from "@/mocks";
import { MOCK_USERS } from "@/stores/authStore";
import { generateId } from "@/lib/utils";
import { savePendingChangeRequests } from "@/lib/persistedChangeRequests";
import { saveSelfRegisteredPatient } from "@/lib/selfRegisteredPatients";

// In-memory persistent state during user session
let clinicProfile: ClinicProfile = { ...MOCK_CLINIC_PROFILE };
let departments: Department[] = [...MOCK_DEPARTMENTS];
let services: Service[] = [...MOCK_SERVICES];
let procedures: Procedure[] = [...MOCK_PROCEDURES];
let payers: Payer[] = [...MOCK_PAYERS];
let doctors: Doctor[] = [...MOCK_DOCTORS];
let patients: Patient[] = [...MOCK_PATIENTS];
const patientChangeRequests: PatientChangeRequest[] = [];
let medicines: Medicine[] = [...MOCK_MEDICINES];
const batches: MedicineBatch[] = [...MOCK_BATCHES];
const stockMovements: StockMovement[] = [...MOCK_STOCK_MOVEMENTS];
let suppliers: Supplier[] = [...MOCK_SUPPLIERS];
const purchases: Purchase[] = [...MOCK_PURCHASES];
const queues: Queue[] = [...MOCK_QUEUES];
const visits: Visit[] = [...MOCK_VISITS];
const medicalRecords: MedicalRecord[] = [...MOCK_MEDICAL_RECORDS];
const prescriptions: Prescription[] = [...MOCK_PRESCRIPTIONS];
const invoices: Invoice[] = [...MOCK_INVOICES];
const payments: Payment[] = [...MOCK_PAYMENTS];
const auditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];
let users: User[] = [...MOCK_USERS];

// Helper to simulate latency
async function simulateNetwork<T>(data: T, allowError = false): Promise<T> {
  const latency = Math.floor(Math.random() * 300) + 100;
  await new Promise((resolve) => setTimeout(resolve, latency));
  
  if (allowError && Math.random() < 0.02) {
    throw new Error("Simulated network issue. Please retry.");
  }
  return JSON.parse(JSON.stringify(data));
}

// 1. Patient Service
export const patientService = {
  async getAll(): Promise<Patient[]> {
    return simulateNetwork(patients);
  },
  async getById(id: string): Promise<Patient | null> {
    const patient = patients.find((p) => p.id === id) || null;
    return simulateNetwork(patient);
  },
  /** Merges patients (e.g. restored from localStorage) into the in-memory mock dataset, skipping ones already present. */
  restoreSelfRegistered(list: Patient[]): void {
    for (const p of list) {
      if (!patients.some((existing) => existing.id === p.id)) {
        patients.push(p);
      }
    }
  },
  async create(data: Omit<Patient, "id" | "mrNumber" | "createdAt">): Promise<Patient> {
    const newId = generateId("pat");
    const count = patients.length + 1;
    const mrNumber = "RM-2026-" + String(count).padStart(4, "0");
    const newPatient: Patient = {
      ...data,
      id: newId,
      mrNumber,
      createdAt: new Date().toISOString().split("T")[0],
    };
    patients.unshift(newPatient);
    auditLogService.log("CREATE_PATIENT", "PATIENT", newId, "Menambah pasien baru: " + newPatient.fullName + " (" + mrNumber + ")");
    return simulateNetwork(newPatient);
  },
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Pasien tidak ditemukan");
    patients[index] = { ...patients[index], ...data };
    // Keep the localStorage mirror in sync too, so an update (e.g. a CS-approved change
    // request) survives a reload instead of being overwritten by a stale restored copy.
    saveSelfRegisteredPatient(patients[index]);
    auditLogService.log("UPDATE_PATIENT", "PATIENT", id, "Mengubah data pasien: " + patients[index].fullName);
    return simulateNetwork(patients[index]);
  },
  async delete(id: string): Promise<boolean> {
    const patient = patients.find((p) => p.id === id);
    patients = patients.filter((p) => p.id !== id);
    if (patient) {
      auditLogService.log("DELETE_PATIENT", "PATIENT", id, "Menghapus pasien: " + patient.fullName);
    }
    return simulateNetwork(true);
  },
};

// 1b. Patient Change Request Service — a patient can only request an edit to their own
// basic data; it only takes effect once staff (reception) approves it.
export const patientChangeRequestService = {
  async getAll(): Promise<PatientChangeRequest[]> {
    return simulateNetwork(patientChangeRequests);
  },
  /** Merges requests restored from localStorage into the in-memory list, skipping ones already present. */
  restore(list: PatientChangeRequest[]): void {
    for (const r of list) {
      if (!patientChangeRequests.some((existing) => existing.id === r.id)) {
        patientChangeRequests.push(r);
      }
    }
  },
  async getPendingForPatient(patientId: string): Promise<PatientChangeRequest | null> {
    const found = patientChangeRequests.find((r) => r.patientId === patientId && r.status === "PENDING") || null;
    return simulateNetwork(found);
  },
  async create(data: {
    patientId: string;
    patientName: string;
    patientMrNumber: string;
    currentValues: { fullName: string; email: string; phone: string };
    requestedValues: { fullName: string; email: string; phone: string };
  }): Promise<PatientChangeRequest> {
    const alreadyPending = patientChangeRequests.some((r) => r.patientId === data.patientId && r.status === "PENDING");
    if (alreadyPending) throw new Error("Anda sudah punya permintaan perubahan yang masih menunggu konfirmasi.");
    const newRequest: PatientChangeRequest = {
      id: generateId("chg"),
      ...data,
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    };
    patientChangeRequests.unshift(newRequest);
    savePendingChangeRequests(patientChangeRequests);
    auditLogService.log("REQUEST_PATIENT_CHANGE", "PATIENT", data.patientId, "Pasien " + data.patientName + " mengajukan perubahan data.");
    return simulateNetwork(newRequest);
  },
  async approve(id: string, reviewerName: string): Promise<PatientChangeRequest> {
    const index = patientChangeRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Permintaan tidak ditemukan");
    const request = patientChangeRequests[index];
    if (request.status !== "PENDING") throw new Error("Permintaan ini sudah diproses sebelumnya.");

    await patientService.update(request.patientId, request.requestedValues);

    patientChangeRequests[index] = {
      ...request,
      status: "APPROVED",
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
    };
    savePendingChangeRequests(patientChangeRequests);
    auditLogService.log("APPROVE_PATIENT_CHANGE", "PATIENT", request.patientId, reviewerName + " menyetujui perubahan data " + request.patientName + ".");
    return simulateNetwork(patientChangeRequests[index]);
  },
  async reject(id: string, reviewerName: string, note?: string): Promise<PatientChangeRequest> {
    const index = patientChangeRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Permintaan tidak ditemukan");
    if (patientChangeRequests[index].status !== "PENDING") throw new Error("Permintaan ini sudah diproses sebelumnya.");

    patientChangeRequests[index] = {
      ...patientChangeRequests[index],
      status: "REJECTED",
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerName,
      reviewNote: note,
    };
    savePendingChangeRequests(patientChangeRequests);
    auditLogService.log("REJECT_PATIENT_CHANGE", "PATIENT", patientChangeRequests[index].patientId, reviewerName + " menolak perubahan data " + patientChangeRequests[index].patientName + ".");
    return simulateNetwork(patientChangeRequests[index]);
  },
};

// 2. Doctor Service
export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    return simulateNetwork(doctors);
  },
  async getById(id: string): Promise<Doctor | null> {
    const doc = doctors.find((d) => d.id === id) || null;
    return simulateNetwork(doc);
  },
  async create(data: Omit<Doctor, "id">): Promise<Doctor> {
    const newId = generateId("doc");
    const newDoc: Doctor = { ...data, id: newId };
    doctors.push(newDoc);
    auditLogService.log("CREATE_DOCTOR", "MASTER", newId, "Menambah dokter: " + newDoc.name);
    return simulateNetwork(newDoc);
  },
  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    const index = doctors.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Dokter tidak ditemukan");
    doctors[index] = { ...doctors[index], ...data };
    auditLogService.log("UPDATE_DOCTOR", "MASTER", id, "Mengubah data dokter: " + doctors[index].name);
    return simulateNetwork(doctors[index]);
  },
  async delete(id: string): Promise<boolean> {
    doctors = doctors.filter((d) => d.id !== id);
    return simulateNetwork(true);
  },
};

// 3. Queue Service — the ONLY place a queue number is minted, regardless of where the
// request comes from (online patient portal, in-clinic kiosk, or staff at the front desk).
// It only ever produces a bare Queue entry (number, source, service/poli, status) — never
// medical data and never a Visit. A Visit is created separately once reception identifies
// the patient (see visitService.createFromQueue).
function transitionQueueStatus(id: string, status: QueueStatus): Queue {
  const index = queues.findIndex((q) => q.id === id);
  if (index === -1) throw new Error("Antrian tidak ditemukan");
  const now = new Date().toISOString();
  queues[index] = {
    ...queues[index],
    status,
    calledAt: status === "CALLED" ? now : queues[index].calledAt,
    callCount: status === "CALLED" ? (queues[index].callCount || 0) + 1 : queues[index].callCount,
    serviceStartedAt: status === "IN_SERVICE" ? now : queues[index].serviceStartedAt,
    completedAt: status === "COMPLETED" ? now : queues[index].completedAt,
  };
  auditLogService.log("UPDATE_QUEUE_STATUS", "QUEUE", id, "Status antrian " + queues[index].queueNumber + " menjadi " + status);
  return queues[index];
}

export const queueService = {
  async getAll(): Promise<Queue[]> {
    return simulateNetwork(queues);
  },
  async getById(id: string): Promise<Queue | null> {
    const queue = queues.find((q) => q.id === id) || null;
    return simulateNetwork(queue);
  },
  async createQueue(data: {
    source: QueueSource;
    /** Null for a kiosk queue taken before the patient has been identified. */
    patientId: string | null;
    departmentId: string;
    doctorId: string;
    serviceId: string;
    payerType: PayerType;
  }): Promise<Queue> {
    const department = departments.find((d) => d.id === data.departmentId);
    const doctor = doctors.find((d) => d.id === data.doctorId);
    const service = services.find((s) => s.id === data.serviceId);
    if (!department || !doctor || !service) {
      throw new Error("Data referensi antrian tidak valid");
    }
    const patient = data.patientId ? patients.find((p) => p.id === data.patientId) : null;
    if (data.patientId && !patient) {
      throw new Error("Pasien tidak ditemukan");
    }

    const deptPrefix = department.code.charAt(0).toUpperCase();
    const countDeptQueues = queues.filter((q) => q.departmentId === department.id).length + 1;
    const queueNumber = deptPrefix + "-" + String(countDeptQueues).padStart(3, "0");

    const newQueue: Queue = {
      id: generateId("q"),
      queueNumber,
      source: data.source,
      patientId: patient?.id ?? null,
      patientName: patient?.fullName || "Pasien Baru (Kiosk)",
      patientMrNumber: patient?.mrNumber || "-",
      departmentId: department.id,
      departmentName: department.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      serviceId: service.id,
      serviceName: service.name,
      payerType: data.payerType,
      status: "WAITING",
      waitingTime: "1 mnt",
      createdAt: new Date().toISOString(),
    };
    queues.unshift(newQueue);

    auditLogService.log(
      "CREATE_QUEUE",
      "QUEUE",
      newQueue.id,
      "Nomor antrian " + queueNumber + " diambil (" + data.source + ") untuk " + department.name
    );
    return simulateNetwork(newQueue);
  },
  async callQueue(id: string): Promise<Queue> {
    return simulateNetwork(transitionQueueStatus(id, "CALLED"));
  },
  /** Reception has opened this entry and is actively identifying/completing the patient. */
  async startQueue(id: string): Promise<Queue> {
    return simulateNetwork(transitionQueueStatus(id, "IN_SERVICE"));
  },
  /** Reception has finished handing the patient off into the clinical pipeline (a Visit now exists). */
  async completeQueue(id: string, visitId?: string): Promise<Queue> {
    const updated = transitionQueueStatus(id, "COMPLETED");
    const index = queues.findIndex((q) => q.id === id);
    if (visitId && index !== -1) {
      queues[index] = { ...queues[index], visitId };
    }
    return simulateNetwork(queues[index] || updated);
  },
  async cancelQueue(id: string): Promise<Queue> {
    return simulateNetwork(transitionQueueStatus(id, "CANCELLED"));
  },
  async markNoShow(id: string): Promise<Queue> {
    return simulateNetwork(transitionQueueStatus(id, "NO_SHOW"));
  },
  /** Reception has identified the patient behind a previously-unidentified kiosk queue entry. */
  async identifyPatient(id: string, patientId: string): Promise<Queue> {
    const index = queues.findIndex((q) => q.id === id);
    if (index === -1) throw new Error("Antrian tidak ditemukan");
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error("Pasien tidak ditemukan");
    queues[index] = { ...queues[index], patientId: patient.id, patientName: patient.fullName, patientMrNumber: patient.mrNumber };
    return simulateNetwork(queues[index]);
  },
};

function calculateAge(birthDate?: string): number {
  if (!birthDate) return 30;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return 30;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : 30;
}

// 4. Visit / Encounter Service — one Visit per queue entry, moving stage by stage through
// the pipeline (Reception -> Nurse -> Doctor -> Follow-up -> Pharmacy/Cashier). Each save*
// method below is owned by exactly one role and only ever writes its own sub-record; data
// from earlier stages is carried along untouched for the next role to read.
export const visitService = {
  async getAll(): Promise<Visit[]> {
    return simulateNetwork(visits);
  },
  async getById(id: string): Promise<Visit | null> {
    const visit = visits.find((v) => v.id === id) || null;
    return simulateNetwork(visit);
  },
  /** Reception identifies/completes the patient behind a queue entry and hands off to Nurse. */
  async createFromQueue(queueId: string, patientId: string, receivedBy?: string): Promise<Visit> {
    const queueIndex = queues.findIndex((q) => q.id === queueId);
    if (queueIndex === -1) throw new Error("Antrian tidak ditemukan");
    const queue = queues[queueIndex];
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error("Pasien tidak ditemukan");

    const visitId = generateId("vst");
    const registrationDate = new Date().toISOString().split("T")[0];
    const newVisit: Visit = {
      id: visitId,
      queueId: queue.id,
      queueNumber: queue.queueNumber,
      source: queue.source,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrNumber: patient.mrNumber,
      patientGender: patient.gender,
      patientAge: calculateAge(patient.birthDate),
      doctorId: queue.doctorId,
      doctorName: queue.doctorName,
      departmentId: queue.departmentId,
      departmentName: queue.departmentName,
      serviceId: queue.serviceId,
      serviceName: queue.serviceName,
      payerType: queue.payerType,
      registrationDate,
      status: "WAITING_NURSE",
      createdAt: new Date().toISOString(),
    };
    visits.unshift(newVisit);

    queues[queueIndex] = {
      ...queue,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrNumber: patient.mrNumber,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      visitId,
    };
    patient.lastVisit = registrationDate;

    auditLogService.log(
      "CREATE_VISIT",
      "VISIT",
      visitId,
      "Pasien " + patient.fullName + " diterima dari antrian " + queue.queueNumber + " oleh " + (receivedBy || "CS") + ", diteruskan ke perawat"
    );
    return simulateNetwork(newVisit);
  },
  /** Nurse triage — first clinical data collected for the visit. */
  async saveNurseAssessment(
    visitId: string,
    data: Omit<NurseAssessment, "recordedBy" | "recordedAt">,
    recordedBy: string
  ): Promise<Visit> {
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) throw new Error("Kunjungan tidak ditemukan");
    visits[index] = {
      ...visits[index],
      nurseAssessment: { ...data, recordedBy, recordedAt: new Date().toISOString() },
      status: "WAITING_DOCTOR",
    };
    auditLogService.log("SAVE_NURSE_ASSESSMENT", "VISIT", visitId, "Pemeriksaan awal perawat selesai untuk " + visits[index].patientName);
    return simulateNetwork(visits[index]);
  },
  /** Doctor examination — diagnosis, treatment, and (optionally) a structured prescription. */
  async saveDoctorExamination(
    visitId: string,
    data: {
      anamnesis?: string;
      examination?: string;
      primaryDiagnosis: string;
      secondaryDiagnosis?: string;
      treatment: string;
      doctorNotes?: string;
      needsFollowUp: boolean;
      followUpInstruction?: string;
      prescriptionItems?: PrescriptionItem[];
    },
    examinedBy: string
  ): Promise<{ visit: Visit; prescription?: Prescription; invoice: Invoice }> {
    const visitIndex = visits.findIndex((v) => v.id === visitId);
    if (visitIndex === -1) throw new Error("Kunjungan tidak ditemukan");

    const currentVisit = visits[visitIndex];
    let prescription: Prescription | undefined;

    // 1. Create Prescription if items provided
    if (data.prescriptionItems && data.prescriptionItems.length > 0) {
      const rxId = generateId("rx");
      const rxCount = prescriptions.length + 1;
      const prescriptionNumber = "RX-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(rxCount).padStart(3, "0");

      prescription = {
        id: rxId,
        prescriptionNumber,
        visitId: currentVisit.id,
        patientId: currentVisit.patientId,
        patientName: currentVisit.patientName,
        patientMrNumber: currentVisit.patientMrNumber,
        doctorId: currentVisit.doctorId,
        doctorName: currentVisit.doctorName,
        departmentName: currentVisit.departmentName,
        items: data.prescriptionItems,
        status: "PENDING",
        notes: data.doctorNotes,
        createdAt: new Date().toISOString(),
      };
      prescriptions.unshift(prescription);
      currentVisit.prescriptionId = rxId;
    }

    // 2. Create Invoice automatically from the registered service + any prescribed medicine
    const invId = generateId("inv");
    const invCount = invoices.length + 1;
    const invoiceNumber = "INV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(invCount).padStart(4, "0");

    const invoiceItems: InvoiceItem[] = [];
    const serviceObj = services.find((s) => s.id === currentVisit.serviceId);
    if (serviceObj) {
      invoiceItems.push({
        id: generateId("invi"),
        type: "SERVICE",
        name: serviceObj.name,
        quantity: 1,
        unitPrice: serviceObj.price,
        subtotal: serviceObj.price,
      });
    }

    if (data.prescriptionItems) {
      data.prescriptionItems.forEach((pItem) => {
        invoiceItems.push({
          id: generateId("invi"),
          type: "MEDICINE",
          name: pItem.medicineName + " (" + pItem.quantity + " " + pItem.unit + ")",
          quantity: pItem.quantity,
          unitPrice: pItem.price,
          subtotal: pItem.price * pItem.quantity,
        });
      });
    }

    const subtotal = invoiceItems.reduce((acc, it) => acc + it.subtotal, 0);
    const isBpjs = currentVisit.payerType === "BPJS";
    const discount = isBpjs ? subtotal : 0;
    const grandTotal = subtotal - discount;

    const invoice: Invoice = {
      id: invId,
      invoiceNumber,
      visitId: currentVisit.id,
      patientId: currentVisit.patientId,
      patientName: currentVisit.patientName,
      patientMrNumber: currentVisit.patientMrNumber,
      payerType: currentVisit.payerType,
      items: invoiceItems,
      subtotal,
      discount,
      tax: 0,
      grandTotal,
      paidAmount: 0,
      remainingAmount: isBpjs ? 0 : grandTotal,
      status: isBpjs ? "PAID" : "UNPAID",
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(invoice);
    currentVisit.invoiceId = invId;

    // 3. Save a read-only Medical Record snapshot (nurse + doctor data combined)
    const nurse = currentVisit.nurseAssessment;
    const mrId = generateId("mr");
    const newRecord: MedicalRecord = {
      id: mrId,
      patientId: currentVisit.patientId,
      patientName: currentVisit.patientName,
      patientMrNumber: currentVisit.patientMrNumber,
      visitId: currentVisit.id,
      date: new Date().toISOString().split("T")[0],
      doctorId: currentVisit.doctorId,
      doctorName: currentVisit.doctorName,
      departmentName: currentVisit.departmentName,
      complaint: nurse?.complaint || "-",
      vitalSigns: {
        bloodPressure: nurse?.bloodPressure || "-",
        temperature: nurse?.temperature || 0,
        pulse: nurse?.pulse || 0,
        respiration: nurse?.respiration || 0,
        weight: nurse?.weight || 0,
        height: nurse?.height || 0,
      },
      primaryDiagnosis: data.primaryDiagnosis,
      secondaryDiagnosis: data.secondaryDiagnosis,
      treatment: data.treatment,
      prescriptionSummary: data.prescriptionItems?.map((i) => i.medicineName).join(", "),
      notes: data.doctorNotes,
    };
    medicalRecords.unshift(newRecord);

    // 4. Update Visit — hand off to Nurse follow-up
    currentVisit.doctorExamination = {
      anamnesis: data.anamnesis,
      examination: data.examination,
      primaryDiagnosis: data.primaryDiagnosis,
      secondaryDiagnosis: data.secondaryDiagnosis,
      treatment: data.treatment,
      doctorNotes: data.doctorNotes,
      hasPrescription: !!prescription,
      needsFollowUp: data.needsFollowUp,
      followUpInstruction: data.followUpInstruction,
      examinedBy,
      examinedAt: new Date().toISOString(),
    };
    currentVisit.status = "WAITING_FOLLOW_UP";

    auditLogService.log(
      "SAVE_DOCTOR_EXAMINATION",
      "VISIT",
      visitId,
      "Pemeriksaan dokter selesai untuk " + currentVisit.patientName + ", diagnosa: " + data.primaryDiagnosis
    );

    return simulateNetwork({ visit: currentVisit, prescription, invoice });
  },
  /** Nurse follow-up after the doctor — routes the patient to Pharmacy (if a prescription was made) or straight to the Cashier. */
  async saveFollowUp(
    visitId: string,
    data: { hasFollowUp: boolean; followUpDate?: string; instruction?: string },
    followedUpBy: string
  ): Promise<Visit> {
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) throw new Error("Kunjungan tidak ditemukan");
    const hasPrescription = !!visits[index].prescriptionId;
    visits[index] = {
      ...visits[index],
      followUp: { ...data, hasPrescription, followedUpBy, followedUpAt: new Date().toISOString() },
      status: hasPrescription ? "WAITING_PHARMACY" : "WAITING_CASHIER",
    };
    auditLogService.log("SAVE_FOLLOW_UP", "VISIT", visitId, "Tindak lanjut perawat selesai untuk " + visits[index].patientName);
    return simulateNetwork(visits[index]);
  },
};

// 5. Medical Record Service
export const medicalRecordService = {
  async getAll(): Promise<MedicalRecord[]> {
    return simulateNetwork(medicalRecords);
  },
  async getByPatientId(patientId: string): Promise<MedicalRecord[]> {
    const list = medicalRecords.filter((m) => m.patientId === patientId);
    return simulateNetwork(list);
  },
  async getById(id: string): Promise<MedicalRecord | null> {
    const record = medicalRecords.find((m) => m.id === id) || null;
    return simulateNetwork(record);
  },
};

// 6. Prescription & Pharmacy Service
export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    return simulateNetwork(prescriptions);
  },
  async getById(id: string): Promise<Prescription | null> {
    const rx = prescriptions.find((p) => p.id === id) || null;
    return simulateNetwork(rx);
  },
  async updateStatus(id: string, status: PrescriptionStatus): Promise<Prescription> {
    const index = prescriptions.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Resep tidak ditemukan");
    prescriptions[index].status = status;
    auditLogService.log("UPDATE_PRESCRIPTION", "PHARMACY", id, "Status resep " + prescriptions[index].prescriptionNumber + " diubah ke " + status);
    return simulateNetwork(prescriptions[index]);
  },
  async dispense(id: string, dispensedBy: string, batchAllocations: Record<string, string>): Promise<Prescription> {
    const index = prescriptions.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Resep tidak ditemukan");
    const rx = prescriptions[index];

    // Deduct batch stocks (FEFO applied)
    rx.items.forEach((item) => {
      const batchId = batchAllocations[item.id] || item.batchId;
      if (batchId) {
        const batchIndex = batches.findIndex((b) => b.id === batchId);
        if (batchIndex !== -1) {
          batches[batchIndex].remainingQuantity = Math.max(0, batches[batchIndex].remainingQuantity - item.quantity);
          item.batchId = batchId;
          item.batchNumber = batches[batchIndex].batchNumber;

          stockMovements.unshift({
            id: generateId("sm"),
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            batchNumber: batches[batchIndex].batchNumber,
            type: "PRESCRIPTION",
            quantity: -item.quantity,
            referenceNumber: rx.prescriptionNumber,
            createdBy: dispensedBy,
          });
        }
      }

      const medIndex = medicines.findIndex((m) => m.id === item.medicineId);
      if (medIndex !== -1) {
        medicines[medIndex].currentStock = Math.max(0, medicines[medIndex].currentStock - item.quantity);
      }
    });

    rx.status = "COMPLETED";
    rx.dispensedAt = new Date().toISOString();
    rx.dispensedBy = dispensedBy;

    // Obat sudah diserahkan — visit diteruskan ke kasir untuk pembayaran, BUKAN langsung selesai.
    const vIndex = visits.findIndex((v) => v.id === rx.visitId);
    if (vIndex !== -1) {
      visits[vIndex].status = "WAITING_CASHIER";
    }

    auditLogService.log("DISPENSE_MEDICINE", "PHARMACY", id, "Dispensing obat resep " + rx.prescriptionNumber + " oleh " + dispensedBy);
    return simulateNetwork(rx);
  },
};

// 7. Medicine & Inventory Service
export const medicineService = {
  async getAll(): Promise<Medicine[]> {
    return simulateNetwork(medicines);
  },
  async getById(id: string): Promise<Medicine | null> {
    const med = medicines.find((m) => m.id === id) || null;
    return simulateNetwork(med);
  },
  async create(data: Omit<Medicine, "id">): Promise<Medicine> {
    const newId = generateId("med");
    const newMed: Medicine = { ...data, id: newId };
    medicines.push(newMed);
    auditLogService.log("CREATE_MEDICINE", "INVENTORY", newId, "Menambah obat baru: " + newMed.name);
    return simulateNetwork(newMed);
  },
  async update(id: string, data: Partial<Medicine>): Promise<Medicine> {
    const index = medicines.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Obat tidak ditemukan");
    medicines[index] = { ...medicines[index], ...data };
    auditLogService.log("UPDATE_MEDICINE", "INVENTORY", id, "Mengubah data obat: " + medicines[index].name);
    return simulateNetwork(medicines[index]);
  },
  async delete(id: string): Promise<boolean> {
    medicines = medicines.filter((m) => m.id !== id);
    return simulateNetwork(true);
  },
  async getBatches(medicineId?: string): Promise<MedicineBatch[]> {
    let list = batches;
    if (medicineId) {
      list = batches.filter((b) => b.medicineId === medicineId);
    }
    list.sort((a, b) => new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime());
    return simulateNetwork(list);
  },
  async addBatch(data: Omit<MedicineBatch, "id">): Promise<MedicineBatch> {
    const newId = generateId("btc");
    const newBatch: MedicineBatch = { ...data, id: newId };
    batches.push(newBatch);
    
    const medIndex = medicines.findIndex((m) => m.id === data.medicineId);
    if (medIndex !== -1) {
      medicines[medIndex].currentStock += data.quantity;
    }

    auditLogService.log("ADD_BATCH", "INVENTORY", newId, "Menambah batch obat: " + data.medicineName + " (" + data.batchNumber + ")");
    return simulateNetwork(newBatch);
  },
};

export const inventoryService = {
  async getSummary(): Promise<InventorySummary> {
    const totalItems = medicines.length;
    const lowStockCount = medicines.filter((m) => m.currentStock <= m.minimumStock && m.currentStock > 0).length;
    const outOfStockCount = medicines.filter((m) => m.currentStock === 0).length;
    const expiredCount = batches.filter((b) => b.status === "EXPIRED" && b.remainingQuantity > 0).length;
    const expiringSoonCount = batches.filter((b) => b.status === "EXPIRING_SOON" && b.remainingQuantity > 0).length;
    return simulateNetwork({
      totalItems,
      lowStockCount,
      outOfStockCount,
      expiredCount,
      expiringSoonCount,
    });
  },
  async getMovements(): Promise<StockMovement[]> {
    return simulateNetwork(stockMovements);
  },
};

// 8. Supplier & Purchase Service
export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    return simulateNetwork(suppliers);
  },
  async getById(id: string): Promise<Supplier | null> {
    const sup = suppliers.find((s) => s.id === id) || null;
    return simulateNetwork(sup);
  },
  async create(data: Omit<Supplier, "id">): Promise<Supplier> {
    const newId = generateId("sup");
    const newSup: Supplier = { ...data, id: newId };
    suppliers.push(newSup);
    auditLogService.log("CREATE_SUPPLIER", "PURCHASE", newId, "Menambah supplier: " + newSup.name);
    return simulateNetwork(newSup);
  },
  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const index = suppliers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Supplier tidak ditemukan");
    suppliers[index] = { ...suppliers[index], ...data };
    return simulateNetwork(suppliers[index]);
  },
  async delete(id: string): Promise<boolean> {
    suppliers = suppliers.filter((s) => s.id !== id);
    return simulateNetwork(true);
  },
};

export const purchaseService = {
  async getAll(): Promise<Purchase[]> {
    return simulateNetwork(purchases);
  },
  async getById(id: string): Promise<Purchase | null> {
    const po = purchases.find((p) => p.id === id) || null;
    return simulateNetwork(po);
  },
  async create(data: {
    supplierId: string;
    purchaseDate: string;
    items: PurchaseItem[];
    notes?: string;
  }): Promise<Purchase> {
    const supplier = suppliers.find((s) => s.id === data.supplierId);
    if (!supplier) throw new Error("Supplier tidak ditemukan");

    const newId = generateId("po");
    const count = purchases.length + 1;
    const purchaseNumber = "PO-2026-" + String(count).padStart(4, "0");

    const subtotal = data.items.reduce((acc, it) => acc + it.subtotal, 0);
    const tax = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + tax;

    const newPurchase: Purchase = {
      id: newId,
      purchaseNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      purchaseDate: data.purchaseDate,
      items: data.items,
      subtotal,
      discount: 0,
      tax,
      grandTotal,
      status: "RECEIVED",
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    purchases.unshift(newPurchase);

    data.items.forEach((it) => {
      const batchId = generateId("btc");
      batches.unshift({
        id: batchId,
        medicineId: it.medicineId,
        medicineName: it.medicineName,
        batchNumber: it.batchNumber,
        entryDate: data.purchaseDate,
        expiredDate: it.expiredDate,
        purchasePrice: it.purchasePrice,
        quantity: it.quantity,
        remainingQuantity: it.quantity,
        status: "NORMAL",
      });

      const medIndex = medicines.findIndex((m) => m.id === it.medicineId);
      if (medIndex !== -1) {
        medicines[medIndex].currentStock += it.quantity;
      }

      stockMovements.unshift({
        id: generateId("sm"),
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        medicineId: it.medicineId,
        medicineName: it.medicineName,
        batchNumber: it.batchNumber,
        type: "PURCHASE",
        quantity: it.quantity,
        referenceNumber: purchaseNumber,
        createdBy: "Gudang Farmasi",
      });
    });

    auditLogService.log("CREATE_PURCHASE", "PURCHASE", newId, "Penerimaan PO " + purchaseNumber + " dari " + supplier.name);
    return simulateNetwork(newPurchase);
  },
};

// 9. Billing & Payment Service
export const billingService = {
  async getAll(): Promise<Invoice[]> {
    return simulateNetwork(invoices);
  },
  async getById(id: string): Promise<Invoice | null> {
    const inv = invoices.find((i) => i.id === id) || null;
    return simulateNetwork(inv);
  },
};

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    return simulateNetwork(payments);
  },
  async create(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    cashierName?: string;
  }): Promise<{ payment: Payment; invoice: Invoice }> {
    const invoiceIndex = invoices.findIndex((i) => i.id === data.invoiceId);
    if (invoiceIndex === -1) throw new Error("Tagihan invoice tidak ditemukan");

    const inv = invoices[invoiceIndex];
    if (data.amount <= 0) throw new Error("Nominal pembayaran harus lebih dari 0");

    const newPaidAmount = inv.paidAmount + data.amount;
    const remaining = Math.max(0, inv.grandTotal - newPaidAmount);
    const change = Math.max(0, data.amount - inv.remainingAmount);

    inv.paidAmount = Math.min(inv.grandTotal, newPaidAmount);
    inv.remainingAmount = remaining;
    inv.status = remaining === 0 ? "PAID" : "PARTIAL";

    const paymentId = generateId("pay");
    const count = payments.length + 1;
    const paymentNumber = "PAY-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(count).padStart(3, "0");

    const newPayment: Payment = {
      id: paymentId,
      paymentNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientId: inv.patientId,
      patientName: inv.patientName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      change,
      remainingInvoiceAmount: remaining,
      paidAt: new Date().toISOString(),
      cashierName: data.cashierName || "Kasir Utama",
    };

    payments.unshift(newPayment);
    auditLogService.log(
      "CREATE_PAYMENT",
      "PAYMENT",
      paymentId,
      "Pembayaran invoice " + inv.invoiceNumber + " sebesar Rp " + data.amount.toLocaleString("id-ID") + " via " + data.paymentMethod
    );

    // Lunas — ini satu-satunya tempat yang menutup sebuah visit sebagai COMPLETED.
    if (remaining === 0 && inv.visitId) {
      const vIndex = visits.findIndex((v) => v.id === inv.visitId);
      if (vIndex !== -1) {
        visits[vIndex].status = "COMPLETED";
        visits[vIndex].completedAt = new Date().toISOString();
      }
    }

    return simulateNetwork({ payment: newPayment, invoice: inv });
  },
};

// 10. Master Data Service
export const masterService = {
  async getDepartments(): Promise<Department[]> {
    return simulateNetwork(departments);
  },
  async createDepartment(data: Omit<Department, "id">): Promise<Department> {
    const newId = generateId("dept");
    const newDept: Department = { ...data, id: newId };
    departments.push(newDept);
    return simulateNetwork(newDept);
  },
  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Departemen tidak ditemukan");
    departments[index] = { ...departments[index], ...data };
    return simulateNetwork(departments[index]);
  },
  async deleteDepartment(id: string): Promise<boolean> {
    departments = departments.filter((d) => d.id !== id);
    return simulateNetwork(true);
  },

  async getServices(): Promise<Service[]> {
    return simulateNetwork(services);
  },
  async createService(data: Omit<Service, "id">): Promise<Service> {
    const newId = generateId("srv");
    const newSrv: Service = { ...data, id: newId };
    services.push(newSrv);
    return simulateNetwork(newSrv);
  },
  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Layanan tidak ditemukan");
    services[index] = { ...services[index], ...data };
    return simulateNetwork(services[index]);
  },
  async deleteService(id: string): Promise<boolean> {
    services = services.filter((s) => s.id !== id);
    return simulateNetwork(true);
  },

  async getProcedures(): Promise<Procedure[]> {
    return simulateNetwork(procedures);
  },
  async createProcedure(data: Omit<Procedure, "id">): Promise<Procedure> {
    const newId = generateId("prc");
    const newPrc: Procedure = { ...data, id: newId };
    procedures.push(newPrc);
    return simulateNetwork(newPrc);
  },
  async updateProcedure(id: string, data: Partial<Procedure>): Promise<Procedure> {
    const index = procedures.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Tindakan tidak ditemukan");
    procedures[index] = { ...procedures[index], ...data };
    return simulateNetwork(procedures[index]);
  },
  async deleteProcedure(id: string): Promise<boolean> {
    procedures = procedures.filter((p) => p.id !== id);
    return simulateNetwork(true);
  },

  async getPayers(): Promise<Payer[]> {
    return simulateNetwork(payers);
  },
  async createPayer(data: Omit<Payer, "id">): Promise<Payer> {
    const newId = generateId("pyr");
    const newPayer: Payer = { ...data, id: newId };
    payers.push(newPayer);
    return simulateNetwork(newPayer);
  },
  async updatePayer(id: string, data: Partial<Payer>): Promise<Payer> {
    const index = payers.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Payer tidak ditemukan");
    payers[index] = { ...payers[index], ...data };
    return simulateNetwork(payers[index]);
  },
  async deletePayer(id: string): Promise<boolean> {
    payers = payers.filter((p) => p.id !== id);
    return simulateNetwork(true);
  },

  async getUsers(): Promise<User[]> {
    return simulateNetwork(users);
  },
  async createUser(data: Omit<User, "id">): Promise<User> {
    const newId = generateId("usr");
    const newUser: User = { ...data, id: newId, lastLogin: new Date().toISOString() };
    users.push(newUser);
    return simulateNetwork(newUser);
  },
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User tidak ditemukan");
    users[index] = { ...users[index], ...data };
    return simulateNetwork(users[index]);
  },
  async deleteUser(id: string): Promise<boolean> {
    users = users.filter((u) => u.id !== id);
    return simulateNetwork(true);
  },
};

// 11. Clinic Settings & Audit Log Service
export const clinicService = {
  async getProfile(): Promise<ClinicProfile> {
    return simulateNetwork(clinicProfile);
  },
  async updateProfile(data: Partial<ClinicProfile>): Promise<ClinicProfile> {
    clinicProfile = { ...clinicProfile, ...data };
    auditLogService.log("UPDATE_CLINIC_PROFILE", "SETTINGS", clinicProfile.id, "Memperbarui profil dan kontak klinik");
    return simulateNetwork(clinicProfile);
  },
};

export const auditLogService = {
  async getAll(): Promise<AuditLog[]> {
    return simulateNetwork(auditLogs);
  },
  log(action: string, module: string, recordId: string, description: string, user?: { id: string; name: string; role: Role }) {
    const newLog: AuditLog = {
      id: generateId("log"),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userId: user?.id || "usr-sys",
      userName: user?.name || "System User",
      userRole: user?.role || "ADMIN",
      action,
      module,
      recordId,
      description,
    };
    auditLogs.unshift(newLog);
  },
};

// 12. Report Service
export const reportService = {
  async getDashboardStats() {
    const totalPatients = patients.length;
    const todayVisits = visits.length;
    const activeQueues = queues.filter((q) => q.status === "WAITING" || q.status === "IN_SERVICE" || q.status === "CALLED").length;
    const todayRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    return simulateNetwork({
      totalPatients,
      todayVisits,
      activeQueues,
      todayRevenue,
    });
  },

  async getPatientReport() {
    return simulateNetwork({
      totalPatients: patients.length,
      newPatientsThisMonth: 12,
      activePatientsThisMonth: 18,
      byPayer: [
        { payer: "BPJS", count: patients.filter((p) => p.payer === "BPJS").length || 8 },
        { payer: "Umum (Mandiri)", count: patients.filter((p) => p.payer === "GENERAL").length || 6 },
        { payer: "Asuransi Swasta", count: patients.filter((p) => p.payer === "INSURANCE").length || 4 },
        { payer: "Corporate", count: patients.filter((p) => p.payer === "CORPORATE").length || 2 },
      ],
      byAgeGroup: [
        { group: "0-5 th (Balita)", count: 3 },
        { group: "6-17 th (Anak)", count: 4 },
        { group: "18-35 th (Dewasa)", count: 8 },
        { group: "36-55 th (Pra-Lansia)", count: 4 },
        { group: ">55 th (Lansia)", count: 3 },
      ],
    });
  },

  async getVisitReport() {
    return simulateNetwork({
      totalVisits: visits.length,
      completedVisits: visits.filter((v) => v.status === "COMPLETED").length || 4,
      averagePerDay: 15,
      byDepartment: [
        { name: "Poli Umum", count: 8 },
        { name: "Poli Gigi", count: 4 },
        { name: "Poli Penyakit Dalam", count: 3 },
        { name: "Poli Anak", count: 2 },
      ],
      byDoctor: [
        { name: "dr. Hendra Pratama", count: 6 },
        { name: "drg. Siti Nurhaliza", count: 4 },
        { name: "dr. Fauzi Ahmad, Sp.PD", count: 3 },
        { name: "dr. Maya Indah, Sp.A", count: 2 },
      ],
    });
  },

  async getRevenueReport() {
    const totalRev = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalRec = invoices.reduce((acc, i) => acc + i.remainingAmount, 0);

    return simulateNetwork({
      totalRevenue: totalRev,
      totalPaid: totalPaid,
      totalReceivable: totalRec,
      byPaymentMethod: [
        { method: "QRIS", amount: 450000 },
        { method: "Tunai (Cash)", amount: 300000 },
        { method: "Debit / EDC", amount: 250000 },
        { method: "Klaim BPJS", amount: 600000 },
      ],
      dailyRevenue: [
        { date: "Senin", amount: 350000 },
        { date: "Selasa", amount: 420000 },
        { date: "Rabu", amount: 280000 },
        { date: "Kamis", amount: 510000 },
        { date: "Jumat", amount: 620000 },
        { date: "Sabtu", amount: 480000 },
      ],
    });
  },

  async getPharmacyReport() {
    return simulateNetwork({
      totalPrescriptions: prescriptions.length,
      completedPrescriptions: prescriptions.filter((p) => p.status === "COMPLETED").length || 3,
      topMedicines: [
        { name: "Paracetamol 500 mg", quantity: 180 },
        { name: "Amoxicillin 500 mg", quantity: 120 },
        { name: "Antasida Doen", quantity: 90 },
        { name: "Cetirizine 10 mg", quantity: 75 },
        { name: "Amlodipine 5 mg", quantity: 60 },
      ],
    });
  },

  async getInventoryReport() {
    const totalValuation = medicines.reduce((acc, m) => acc + (m.currentStock * m.purchasePrice), 0);
    return simulateNetwork({
      totalValuation,
      valuationByCategory: [
        { category: "Analgesik", value: 1200000 },
        { category: "Antibiotik", value: 2400000 },
        { category: "Antihipertensi", value: 1800000 },
        { category: "Antidiabetes", value: 950000 },
        { category: "Saluran Cerna", value: 850000 },
      ],
    });
  },
};