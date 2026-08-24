import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nickname: z.string().optional(),
  nik: z.string().length(16, "NIK harus tepat 16 digit angka").regex(/^\d+$/, "NIK harus berupa angka"),
  birthPlace: z.string().min(2, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["MALE", "FEMALE"]),
  bloodType: z.enum(["A", "B", "AB", "O", "-"]),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit").regex(/^[0-9+\-\s]+$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  city: z.string().min(2, "Kota / Kabupaten wajib diisi"),
  district: z.string().min(2, "Kecamatan wajib diisi"),
  village: z.string().min(2, "Kelurahan / Desa wajib diisi"),
  postalCode: z.string().min(5, "Kode pos minimal 5 digit"),
  allergy: z.string().optional(),
  specialNotes: z.string().optional(),
  payer: z.enum(["GENERAL", "BPJS", "INSURANCE", "CORPORATE"]),
  insuranceNumber: z.string().optional(),
  company: z.string().optional(),
  sepNumber: z.string().optional(),
  faskes1: z.string().optional(),
  referralType: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const patientSelfRegisterSchema = patientSchema
  .extend({
    // Email is optional on the base patient record (staff may not always have it), but
    // required here since login for self-service accounts is email + password based.
    email: z.string().email("Format email wajib diisi dan valid"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi kata sandi minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export type PatientSelfRegisterFormValues = z.infer<typeof patientSelfRegisterSchema>;

export const registrationSchema = z.object({
  patientId: z.string().min(1, "Pilih pasien terlebih dahulu"),
  departmentId: z.string().min(1, "Pilih poliklinik tujuan"),
  doctorId: z.string().min(1, "Pilih dokter pemeriksa"),
  serviceId: z.string().min(1, "Pilih layanan medis"),
  payerType: z.enum(["GENERAL", "BPJS", "INSURANCE", "CORPORATE"]),
  registrationDate: z.string().min(1, "Tanggal registrasi wajib diisi"),
  complaint: z.string().min(3, "Keluhan utama minimal 3 karakter"),
  notes: z.string().optional(),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const doctorSchema = z.object({
  name: z.string().min(3, "Nama dokter wajib diisi"),
  licenseNumber: z.string().min(3, "Nomor SIP wajib diisi"),
  specialization: z.string().min(2, "Spesialisasi wajib diisi"),
  departmentId: z.string().min(1, "Pilih poliklinik / departemen"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  email: z.string().email("Format email tidak valid"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;

export const visitExaminationSchema = z.object({
  complaint: z.string().min(2, "Keluhan utama wajib diisi"),
  historyOfPresentIllness: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  allergy: z.string().optional(),
  bloodPressure: z.string().min(3, "Tekanan darah wajib diisi (cth: 120/80)"),
  temperature: z.number().min(30, "Suhu tubuh tidak valid").max(45, "Suhu tubuh tidak valid"),
  pulse: z.number().min(30, "Denyut nadi tidak valid").max(200, "Denyut nadi tidak valid"),
  respiration: z.number().min(8, "Laju pernapasan tidak valid").max(60, "Laju pernapasan tidak valid"),
  spo2: z.number().min(50, "SpO2 tidak valid").max(100, "SpO2 tidak valid"),
  weight: z.number().min(1, "Berat badan tidak valid").max(300, "Berat badan tidak valid"),
  height: z.number().min(30, "Tinggi badan tidak valid").max(250, "Tinggi badan tidak valid"),
  primaryDiagnosis: z.string().min(3, "Diagnosa utama wajib diisi"),
  secondaryDiagnosis: z.string().optional(),
  treatment: z.string().min(2, "Tindakan / terapi wajib diisi"),
  notes: z.string().optional(),
});

export type VisitExaminationFormValues = z.infer<typeof visitExaminationSchema>;

export const medicineSchema = z.object({
  code: z.string().min(2, "Kode obat wajib diisi"),
  name: z.string().min(2, "Nama obat wajib diisi"),
  genericName: z.string().min(2, "Nama generik wajib diisi"),
  category: z.string().min(2, "Kategori obat wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  manufacturer: z.string().min(2, "Pabrikan wajib diisi"),
  purchasePrice: z.number().min(0, "Harga beli minimal 0"),
  sellingPrice: z.number().min(0, "Harga jual minimal 0"),
  minimumStock: z.number().min(0, "Stok minimum minimal 0"),
  currentStock: z.number().min(0, "Stok awal minimal 0"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;

export const supplierSchema = z.object({
  code: z.string().min(2, "Kode supplier wajib diisi"),
  name: z.string().min(2, "Nama supplier wajib diisi"),
  pic: z.string().min(2, "Nama PIC wajib diisi"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  email: z.string().email("Format email tidak valid"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  npwp: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Pilih supplier"),
  purchaseDate: z.string().min(1, "Tanggal pembelian wajib diisi"),
  notes: z.string().optional(),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Pilih tagihan"),
  amount: z.number().min(1, "Nominal pembayaran minimal Rp 1"),
  paymentMethod: z.enum(["CASH", "DEBIT", "QRIS", "TRANSFER", "INSURANCE", "BPJS"]),
  referenceNumber: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const clinicProfileSchema = z.object({
  name: z.string().min(3, "Nama klinik minimal 3 karakter"),
  shortName: z.string().min(2, "Nama singkat wajib diisi"),
  tagline: z.string().min(5, "Tagline wajib diisi"),
  description: z.string().min(10, "Deskripsi wajib diisi"),
  address: z.string().min(5, "Alamat wajib diisi"),
  city: z.string().min(2, "Kota wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  whatsapp: z.string().min(8, "Nomor WhatsApp minimal 8 digit"),
  email: z.string().email("Format email tidak valid"),
  website: z.string().url("Format URL tidak valid"),
});

export type ClinicProfileFormValues = z.infer<typeof clinicProfileSchema>;
