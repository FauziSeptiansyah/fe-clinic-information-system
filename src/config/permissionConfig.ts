import { Permission, Role } from "@/types";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "patients.view", "patients.create", "patients.update", "patients.delete",
    "registrations.view", "registrations.create",
    "queues.view", "queues.manage",
    "visits.view", "visits.create", "visits.update",
    "medical_records.view", "medical_records.create",
    "prescriptions.view", "prescriptions.process",
    "pharmacy.view", "pharmacy.dispense",
    "medicines.view", "medicines.manage",
    "inventory.view", "inventory.manage",
    "suppliers.view", "suppliers.manage",
    "purchases.view", "purchases.manage",
    "billing.view", "billing.create",
    "payments.view", "payments.create",
    "reports.view",
    "master.view", "master.manage",
    "settings.view", "settings.manage",
  ],
  OWNER: [
    "patients.view", "registrations.view", "queues.view", "visits.view",
    "medical_records.view", "prescriptions.view", "pharmacy.view",
    "medicines.view", "inventory.view", "suppliers.view", "purchases.view",
    "billing.view", "payments.view", "reports.view", "master.view",
    "settings.view",
  ],
  RECEPTIONIST: [
    "patients.view", "patients.create", "patients.update",
    "registrations.view", "registrations.create",
    "queues.view", "queues.manage",
    "billing.view", "payments.view", "payments.create",
  ],
  DOCTOR: [
    "patients.view", "queues.view",
    "visits.view", "visits.update",
    "medical_records.view", "medical_records.create",
    "prescriptions.view", "prescriptions.process",
    "medicines.view",
  ],
  NURSE: [
    "patients.view", "queues.view", "queues.manage",
    "visits.view", "visits.update",
    "medical_records.view",
  ],
  PHARMACIST: [
    "prescriptions.view", "prescriptions.process",
    "pharmacy.view", "pharmacy.dispense",
    "medicines.view", "medicines.manage",
    "inventory.view", "inventory.manage",
    "purchases.view",
  ],
  CASHIER: [
    "billing.view", "billing.create",
    "payments.view", "payments.create",
    "patients.view",
  ],
  WAREHOUSE: [
    "medicines.view", "medicines.manage",
    "inventory.view", "inventory.manage",
    "suppliers.view", "suppliers.manage",
    "purchases.view", "purchases.manage",
  ],
};

export function hasPermission(userRole: Role | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}
