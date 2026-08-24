import {
  Patient,
  Doctor,
  Department,
  Service,
  Procedure,
  Payer,
  PayerType,
  VitalSigns,
  Queue,
  Visit,
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
  QueueStatus,
  PrescriptionStatus,
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

// In-memory persistent state during user session
let clinicProfile: ClinicProfile = { ...MOCK_CLINIC_PROFILE };
let departments: Department[] = [...MOCK_DEPARTMENTS];
let services: Service[] = [...MOCK_SERVICES];
let procedures: Procedure[] = [...MOCK_PROCEDURES];
let payers: Payer[] = [...MOCK_PAYERS];
let doctors: Doctor[] = [...MOCK_DOCTORS];
let patients: Patient[] = [...MOCK_PATIENTS];
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

// 3. Queue & Registration Service
export const queueService = {
  async getAll(): Promise<Queue[]> {
    return simulateNetwork(queues);
  },
  async createRegistration(data: {
    patientId: string;
    departmentId: string;
    doctorId: string;
    serviceId: string;
    payerType: PayerType;
    registrationDate: string;
    complaint: string;
    notes?: string;
  }): Promise<{ queue: Queue; visit: Visit }> {
    const patient = patients.find((p) => p.id === data.patientId);
    const department = departments.find((d) => d.id === data.departmentId);
    const doctor = doctors.find((d) => d.id === data.doctorId);
    const service = services.find((s) => s.id === data.serviceId);

    if (!patient || !department || !doctor || !service) {
      throw new Error("Data referensi pendaftaran tidak valid");
    }

    const deptPrefix = department.code.charAt(0).toUpperCase();
    const countDeptQueues = queues.filter((q) => q.departmentId === department.id).length + 1;
    const queueNumber = deptPrefix + "-" + String(countDeptQueues).padStart(3, "0");

    const queueId = generateId("q");
    const visitId = generateId("vst");

    const newQueue: Queue = {
      id: queueId,
      queueNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrNumber: patient.mrNumber,
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

    const newVisit: Visit = {
      id: visitId,
      queueId: queueId,
      queueNumber: queueNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrNumber: patient.mrNumber,
      patientGender: patient.gender,
      patientAge: 30,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: department.id,
      departmentName: department.name,
      serviceId: service.id,
      serviceName: service.name,
      payerType: data.payerType,
      registrationDate: data.registrationDate,
      status: "REGISTERED",
      complaint: data.complaint,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    queues.unshift(newQueue);
    visits.unshift(newVisit);

    patient.lastVisit = data.registrationDate;

    auditLogService.log(
      "REGISTER_PATIENT",
      "REGISTRATION",
      queueId,
      "Pendaftaran pasien " + patient.fullName + " ke " + department.name + " no antrian " + queueNumber
    );

    return simulateNetwork({ queue: newQueue, visit: newVisit });
  },
  async updateStatus(queueId: string, status: QueueStatus): Promise<Queue> {
    const index = queues.findIndex((q) => q.id === queueId);
    if (index === -1) throw new Error("Antrian tidak ditemukan");

    const now = new Date().toISOString();
    queues[index] = {
      ...queues[index],
      status,
      calledAt: status === "CALLED" ? now : queues[index].calledAt,
      serviceStartedAt: status === "IN_SERVICE" ? now : queues[index].serviceStartedAt,
      completedAt: status === "COMPLETED" ? now : queues[index].completedAt,
    };

    const visitIndex = visits.findIndex((v) => v.queueId === queueId);
    if (visitIndex !== -1) {
      if (status === "IN_SERVICE") visits[visitIndex].status = "IN_EXAMINATION";
      if (status === "COMPLETED") visits[visitIndex].status = "COMPLETED";
      if (status === "CANCELLED") visits[visitIndex].status = "CANCELLED";
    }

    auditLogService.log("UPDATE_QUEUE_STATUS", "QUEUE", queueId, "Update status antrian " + queues[index].queueNumber + " menjadi " + status);
    return simulateNetwork(queues[index]);
  },
};

// 4. Visit & Medical Examination Service
export const visitService = {
  async getAll(): Promise<Visit[]> {
    return simulateNetwork(visits);
  },
  async getById(id: string): Promise<Visit | null> {
    const visit = visits.find((v) => v.id === id) || null;
    return simulateNetwork(visit);
  },
  async saveExamination(
    visitId: string,
    data: {
      complaint: string;
      historyOfPresentIllness?: string;
      pastMedicalHistory?: string;
      allergy?: string;
      vitalSigns: VitalSigns;
      primaryDiagnosis: string;
      secondaryDiagnosis?: string;
      treatment: string;
      notes?: string;
      prescriptionItems?: PrescriptionItem[];
    }
  ): Promise<{ visit: Visit; prescription?: Prescription; invoice?: Invoice }> {
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
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };
      prescriptions.unshift(prescription);
      currentVisit.prescriptionId = rxId;
    }

    // 2. Create Invoice automatically from service + prescription
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
      paidAmount: isBpjs ? 0 : 0,
      remainingAmount: isBpjs ? 0 : grandTotal,
      status: isBpjs ? "PAID" : "UNPAID",
      createdAt: new Date().toISOString(),
    };
    invoices.unshift(invoice);
    currentVisit.invoiceId = invId;

    // 3. Save Medical Record
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
      complaint: data.complaint,
      vitalSigns: data.vitalSigns,
      primaryDiagnosis: data.primaryDiagnosis,
      secondaryDiagnosis: data.secondaryDiagnosis,
      treatment: data.treatment,
      prescriptionSummary: data.prescriptionItems?.map((i) => i.medicineName).join(", "),
      notes: data.notes,
    };
    medicalRecords.unshift(newRecord);

    // 4. Update Visit & Queue
    currentVisit.status = prescription ? "PHARMACY_WAITING" : "COMPLETED";
    currentVisit.complaint = data.complaint;
    currentVisit.historyOfPresentIllness = data.historyOfPresentIllness;
    currentVisit.pastMedicalHistory = data.pastMedicalHistory;
    currentVisit.allergy = data.allergy;
    currentVisit.vitalSigns = data.vitalSigns;
    currentVisit.primaryDiagnosis = data.primaryDiagnosis;
    currentVisit.secondaryDiagnosis = data.secondaryDiagnosis;
    currentVisit.treatment = data.treatment;
    currentVisit.notes = data.notes;
    currentVisit.completedAt = new Date().toISOString();

    const qIndex = queues.findIndex((q) => q.id === currentVisit.queueId);
    if (qIndex !== -1) {
      queues[qIndex].status = "COMPLETED";
      queues[qIndex].completedAt = new Date().toISOString();
    }

    auditLogService.log(
      "SAVE_EXAMINATION",
      "VISIT",
      visitId,
      "Pemeriksaan SOAP selesai untuk " + currentVisit.patientName + ", diagnosa: " + data.primaryDiagnosis
    );

    return simulateNetwork({ visit: currentVisit, prescription, invoice });
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

    const vIndex = visits.findIndex((v) => v.id === rx.visitId);
    if (vIndex !== -1) {
      visits[vIndex].status = "COMPLETED";
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