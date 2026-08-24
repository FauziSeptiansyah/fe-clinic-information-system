export type Role = "ADMIN" | "OWNER" | "RECEPTIONIST" | "DOCTOR" | "NURSE" | "PHARMACIST" | "CASHIER" | "WAREHOUSE";

export type Permission =
  | "patients.view"
  | "patients.create"
  | "patients.update"
  | "patients.delete"
  | "registrations.view"
  | "registrations.create"
  | "queues.view"
  | "queues.manage"
  | "visits.view"
  | "visits.create"
  | "visits.update"
  | "medical_records.view"
  | "medical_records.create"
  | "prescriptions.view"
  | "prescriptions.process"
  | "pharmacy.view"
  | "pharmacy.dispense"
  | "medicines.view"
  | "medicines.manage"
  | "inventory.view"
  | "inventory.manage"
  | "suppliers.view"
  | "suppliers.manage"
  | "purchases.view"
  | "purchases.manage"
  | "billing.view"
  | "billing.create"
  | "payments.view"
  | "payments.create"
  | "reports.view"
  | "master.view"
  | "master.manage"
  | "settings.view"
  | "settings.manage";

export type Gender = "MALE" | "FEMALE";
export type BloodType = "A" | "B" | "AB" | "O" | "-";
export type PayerType = "GENERAL" | "BPJS" | "INSURANCE" | "CORPORATE";
export type QueueStatus = "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "SKIPPED" | "CANCELLED";
export type VisitStatus = "REGISTERED" | "IN_EXAMINATION" | "EXAMINED" | "PHARMACY_WAITING" | "COMPLETED" | "CANCELLED";
export type PrescriptionStatus = "PENDING" | "PROCESSING" | "READY" | "COMPLETED" | "CANCELLED";
export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID" | "VOID";
export type PaymentMethod = "CASH" | "DEBIT" | "QRIS" | "TRANSFER" | "INSURANCE" | "BPJS";
export type BatchStatus = "NORMAL" | "EXPIRING_SOON" | "EXPIRED";
export type StockMovementType = "PURCHASE" | "SALE" | "PRESCRIPTION" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | "RETURN";
export type PurchaseStatus = "PENDING" | "RECEIVED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
}

export interface Patient {
  id: string;
  mrNumber: string;
  nik: string;
  fullName: string;
  nickname?: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  bloodType: BloodType;
  phone: string;
  email?: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  allergy?: string;
  specialNotes?: string;
  payer: PayerType;
  insuranceNumber?: string;
  company?: string;
  sepNumber?: string;
  faskes1?: string;
  referralType?: string;
  status: "ACTIVE" | "INACTIVE";
  lastVisit?: string;
  createdAt: string;
  /** Only set for patients who self-registered an online account (mock/local only — not securely hashed). */
  password?: string;
}

export interface DoctorSchedule {
  id: string;
  day: "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU" | "MINGGU";
  startTime: string;
  endTime: string;
  departmentId: string;
  departmentName: string;
}

export interface Doctor {
  id: string;
  name: string;
  licenseNumber: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  phone: string;
  email: string;
  photo?: string;
  status: "ACTIVE" | "INACTIVE";
  schedules: DoctorSchedule[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  roomNumber?: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  departmentId?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Procedure {
  id: string;
  code: string;
  name: string;
  price: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Payer {
  id: string;
  name: string;
  type: PayerType;
  code: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Queue {
  id: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  payerType: PayerType;
  status: QueueStatus;
  waitingTime: string;
  calledAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface VitalSigns {
  bloodPressure: string;
  temperature: number;
  pulse: number;
  respiration: number;
  spo2: number;
  weight: number;
  height: number;
}

export interface Visit {
  id: string;
  queueId: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  patientGender: Gender;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  serviceId: string;
  serviceName: string;
  payerType: PayerType;
  registrationDate: string;
  status: VisitStatus;
  complaint: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  allergy?: string;
  vitalSigns?: VitalSigns;
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  treatment?: string;
  notes?: string;
  prescriptionId?: string;
  invoiceId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  visitId: string;
  date: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  complaint: string;
  vitalSigns: VitalSigns;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  treatment: string;
  prescriptionSummary?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  unit: string;
  instructions: string;
  price: number;
  notes?: string;
  batchId?: string;
  batchNumber?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  visitId: string;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  items: PrescriptionItem[];
  status: PrescriptionStatus;
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: string;
  unit: string;
  manufacturer: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock: number;
  currentStock: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  entryDate: string;
  expiredDate: string;
  purchasePrice: number;
  quantity: number;
  remainingQuantity: number;
  status: BatchStatus;
}

export interface StockMovement {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  batchNumber?: string;
  type: StockMovementType;
  quantity: number;
  referenceNumber: string;
  notes?: string;
  createdBy: string;
}

export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiredCount: number;
  expiringSoonCount: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  npwp?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface PurchaseItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiredDate: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: PurchaseStatus;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  type: "SERVICE" | "PROCEDURE" | "MEDICINE";
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  visitId?: string;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  payerType: PayerType;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  change: number;
  remainingInvoiceAmount: number;
  paidAt: string;
  cashierName: string;
}

export interface OperatingHour {
  day: "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU" | "MINGGU";
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface ClinicProfile {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  favicon?: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  operatingHours: OperatingHour[];
  services: string[];
  doctorsCount: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: string;
  recordId?: string;
  description: string;
}

export interface PatientReportData {
  totalPatients: number;
  newPatientsThisMonth: number;
  activePatientsThisMonth: number;
  byPayer: { payer: string; count: number }[];
  byAgeGroup: { group: string; count: number }[];
}

export interface VisitReportData {
  totalVisits: number;
  completedVisits: number;
  averagePerDay: number;
  byDepartment: { name: string; count: number }[];
  byDoctor: { name: string; count: number }[];
}

export interface RevenueReportData {
  totalRevenue: number;
  totalPaid: number;
  totalReceivable: number;
  byPaymentMethod: { method: string; amount: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export interface PharmacyReportData {
  totalPrescriptions: number;
  completedPrescriptions: number;
  topMedicines: { name: string; quantity: number }[];
}

export interface InventoryReportData {
  totalValuation: number;
  valuationByCategory: { category: string; value: number }[];
}
