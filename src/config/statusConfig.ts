import { QueueStatus, VisitStatus, PrescriptionStatus, InvoiceStatus, BatchStatus, PurchaseStatus, PayerType } from "@/types";

export interface StatusStyle {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const QUEUE_STATUS_CONFIG: Record<QueueStatus, StatusStyle> = {
  WAITING: {
    label: "Menunggu",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  CALLED: {
    label: "Dipanggil",
    variant: "info",
    bgClass: "bg-cyan-50",
    textClass: "text-cyan-700",
    borderClass: "border-cyan-200",
  },
  IN_SERVICE: {
    label: "Pemeriksaan",
    variant: "default",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  COMPLETED: {
    label: "Selesai",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  NO_SHOW: {
    label: "Tidak Hadir",
    variant: "secondary",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-200",
  },
  CANCELLED: {
    label: "Batal",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export const VISIT_STATUS_CONFIG: Record<VisitStatus, StatusStyle> = {
  WAITING_RECEPTION: {
    label: "Menunggu Registrasi",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  WAITING_NURSE: {
    label: "Menunggu Perawat",
    variant: "info",
    bgClass: "bg-cyan-50",
    textClass: "text-cyan-700",
    borderClass: "border-cyan-200",
  },
  WAITING_DOCTOR: {
    label: "Menunggu Dokter",
    variant: "default",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  WAITING_FOLLOW_UP: {
    label: "Menunggu Tindak Lanjut",
    variant: "info",
    bgClass: "bg-teal-50",
    textClass: "text-teal-700",
    borderClass: "border-teal-200",
  },
  WAITING_PHARMACY: {
    label: "Menunggu Farmasi",
    variant: "warning",
    bgClass: "bg-purple-50",
    textClass: "text-purple-700",
    borderClass: "border-purple-200",
  },
  WAITING_CASHIER: {
    label: "Menunggu Kasir",
    variant: "warning",
    bgClass: "bg-orange-50",
    textClass: "text-orange-700",
    borderClass: "border-orange-200",
  },
  COMPLETED: {
    label: "Selesai Kunjungan",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  CANCELLED: {
    label: "Batal",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export const PRESCRIPTION_STATUS_CONFIG: Record<PrescriptionStatus, StatusStyle> = {
  PENDING: {
    label: "Menunggu Penyiapan",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  PROCESSING: {
    label: "Sedang Diracik",
    variant: "info",
    bgClass: "bg-cyan-50",
    textClass: "text-cyan-700",
    borderClass: "border-cyan-200",
  },
  READY: {
    label: "Siap Diserahkan",
    variant: "default",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  COMPLETED: {
    label: "Selesai / Diserahkan",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, StatusStyle> = {
  UNPAID: {
    label: "Belum Bayar",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
  PARTIAL: {
    label: "Sebagian",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  PAID: {
    label: "Lunas",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  VOID: {
    label: "Batal / Void",
    variant: "secondary",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-200",
  },
};

export const BATCH_STATUS_CONFIG: Record<BatchStatus, StatusStyle> = {
  NORMAL: {
    label: "Aman",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  EXPIRING_SOON: {
    label: "Segera Kedaluwarsa",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export const PURCHASE_STATUS_CONFIG: Record<PurchaseStatus, StatusStyle> = {
  PENDING: {
    label: "Pending",
    variant: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  RECEIVED: {
    label: "Diterima",
    variant: "success",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  CANCELLED: {
    label: "Batal",
    variant: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
};

export const PAYER_CONFIG: Record<PayerType, { label: string; badgeVariant: "default" | "secondary" | "outline" | "success" | "info" }> = {
  GENERAL: { label: "Umum / Mandiri", badgeVariant: "outline" },
  BPJS: { label: "BPJS Kesehatan", badgeVariant: "success" },
  INSURANCE: { label: "Asuransi Swasta", badgeVariant: "info" },
  CORPORATE: { label: "Perusahaan / Tagihan", badgeVariant: "secondary" },
};
