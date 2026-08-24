import { ROUTES } from "./routes";
import { Permission } from "@/types";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListOrdered,
  Tv,
  Stethoscope,
  FileText,
  Pill,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  CreditCard,
  BarChart3,
  UserCheck,
  Building2,
  Activity,
  Scissors,
  ShieldCheck,
  ShieldAlert,
  Settings,
  History,
  Building,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permissions?: Permission[];
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    group: "Utama",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Pelayanan Pasien",
    items: [
      {
        title: "Pendaftaran",
        href: ROUTES.REGISTRATIONS.NEW,
        icon: UserPlus,
        permissions: ["registrations.create"],
      },
      {
        title: "Data Pasien",
        href: ROUTES.PATIENTS.LIST,
        icon: Users,
        permissions: ["patients.view"],
      },
      {
        title: "Antrian Poliklinik",
        href: ROUTES.QUEUES.LIST,
        icon: ListOrdered,
        permissions: ["queues.view"],
      },
      {
        title: "Layar Antrian TV",
        href: ROUTES.QUEUES.DISPLAY,
        icon: Tv,
      },
      {
        title: "Kunjungan & Periksa",
        href: ROUTES.VISITS.LIST,
        icon: Stethoscope,
        permissions: ["visits.view"],
      },
      {
        title: "Rekam Medis",
        href: ROUTES.MEDICAL_RECORDS.LIST,
        icon: FileText,
        permissions: ["medical_records.view"],
      },
    ],
  },
  {
    group: "Farmasi & Obat",
    items: [
      {
        title: "Dispensing Farmasi",
        href: ROUTES.PHARMACY,
        icon: Pill,
        permissions: ["pharmacy.view"],
      },
      {
        title: "Resep Elektronik",
        href: ROUTES.PRESCRIPTIONS.LIST,
        icon: FileText,
        permissions: ["prescriptions.view"],
      },
      {
        title: "Katalog Obat",
        href: ROUTES.MEDICINES.LIST,
        icon: Package,
        permissions: ["medicines.view"],
      },
      {
        title: "Stok & Batch (FEFO)",
        href: ROUTES.INVENTORY.LIST,
        icon: Boxes,
        permissions: ["inventory.view"],
      },
      {
        title: "Supplier Obat",
        href: ROUTES.SUPPLIERS,
        icon: Truck,
        permissions: ["suppliers.view"],
      },
      {
        title: "Pembelian (PO)",
        href: ROUTES.PURCHASES.LIST,
        icon: ShoppingCart,
        permissions: ["purchases.view"],
      },
    ],
  },
  {
    group: "Kasir & Keuangan",
    items: [
      {
        title: "Tagihan / Billing",
        href: ROUTES.BILLING.LIST,
        icon: Receipt,
        permissions: ["billing.view"],
      },
      {
        title: "Pembayaran Kasir",
        href: ROUTES.PAYMENTS,
        icon: CreditCard,
        permissions: ["payments.view"],
      },
    ],
  },
  {
    group: "Laporan & Analitik",
    items: [
      {
        title: "Laporan Pasien",
        href: ROUTES.REPORTS.PATIENTS,
        icon: BarChart3,
        permissions: ["reports.view"],
      },
      {
        title: "Laporan Kunjungan",
        href: ROUTES.REPORTS.VISITS,
        icon: BarChart3,
        permissions: ["reports.view"],
      },
      {
        title: "Laporan Pendapatan",
        href: ROUTES.REPORTS.REVENUE,
        icon: BarChart3,
        permissions: ["reports.view"],
      },
      {
        title: "Laporan Farmasi",
        href: ROUTES.REPORTS.PHARMACY,
        icon: BarChart3,
        permissions: ["reports.view"],
      },
      {
        title: "Laporan Inventori",
        href: ROUTES.REPORTS.INVENTORY,
        icon: BarChart3,
        permissions: ["reports.view"],
      },
    ],
  },
  {
    group: "Master Data",
    items: [
      {
        title: "Dokter & Jadwal",
        href: ROUTES.MASTER.DOCTORS,
        icon: UserCheck,
        permissions: ["master.view"],
      },
      {
        title: "Poliklinik / Departemen",
        href: ROUTES.MASTER.DEPARTMENTS,
        icon: Building2,
        permissions: ["master.view"],
      },
      {
        title: "Layanan Medis",
        href: ROUTES.MASTER.SERVICES,
        icon: Activity,
        permissions: ["master.view"],
      },
      {
        title: "Tindakan Medis",
        href: ROUTES.MASTER.PROCEDURES,
        icon: Scissors,
        permissions: ["master.view"],
      },
      {
        title: "Penjamin / Payer",
        href: ROUTES.MASTER.PAYERS,
        icon: ShieldCheck,
        permissions: ["master.view"],
      },
      {
        title: "Manajemen Pengguna",
        href: ROUTES.MASTER.USERS,
        icon: ShieldAlert,
        permissions: ["master.manage"],
      },
    ],
  },
  {
    group: "Pengaturan",
    items: [
      {
        title: "Profil Klinik",
        href: ROUTES.SETTINGS.CLINIC,
        icon: Building,
        permissions: ["settings.view"],
      },
      {
        title: "Role & Izin Akses",
        href: ROUTES.SETTINGS.ROLES,
        icon: Settings,
        permissions: ["settings.manage"],
      },
      {
        title: "Audit Log Sistem",
        href: ROUTES.SETTINGS.AUDIT_LOGS,
        icon: History,
        permissions: ["settings.view"],
      },
    ],
  },
];
