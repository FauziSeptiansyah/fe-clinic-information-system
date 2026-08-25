"use client";

import { useAuthStore } from "@/stores/authStore";
import { PageContainer } from "@/components/common/PageContainer";
import { AdminDashboard } from "@/features/dashboard/AdminDashboard";
import { OwnerDashboard } from "@/features/dashboard/OwnerDashboard";
import { ReceptionistDashboard } from "@/features/dashboard/ReceptionistDashboard";
import { DoctorDashboard } from "@/features/dashboard/DoctorDashboard";
import { NurseDashboard } from "@/features/dashboard/NurseDashboard";
import { PharmacistDashboard } from "@/features/dashboard/PharmacistDashboard";
import { CashierDashboard } from "@/features/dashboard/CashierDashboard";
import { WarehouseDashboard } from "@/features/dashboard/WarehouseDashboard";

export default function DashboardPage() {
  const { user, role } = useAuthStore();

  return (
    <PageContainer>
      {role === "ADMIN" && <AdminDashboard user={user} />}
      {role === "OWNER" && <OwnerDashboard user={user} />}
      {role === "RECEPTIONIST" && <ReceptionistDashboard user={user} />}
      {role === "DOCTOR" && <DoctorDashboard user={user} />}
      {role === "NURSE" && <NurseDashboard user={user} />}
      {role === "PHARMACIST" && <PharmacistDashboard user={user} />}
      {role === "CASHIER" && <CashierDashboard user={user} />}
      {role === "WAREHOUSE" && <WarehouseDashboard user={user} />}
    </PageContainer>
  );
}
