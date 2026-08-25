import { Permission, Role } from "@/types";

/**
 * One patient journey, handed off stage by stage — each role only gets the permissions its
 * own stage needs (Reception -> Nurse -> Doctor -> Nurse follow-up -> Pharmacy -> Cashier).
 * ADMIN and OWNER are deliberately NOT part of that journey: ADMIN manages staff accounts +
 * master data, OWNER is read-only oversight/reporting.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "patients.view",
    "registrations.view",
    "queues.view",
    "visits.view",
    "medical_records.view",
    "prescriptions.view",
    "pharmacy.view",
    "medicines.view",
    "inventory.view",
    "suppliers.view",
    "purchases.view",
    "billing.view",
    "payments.view",
    "reports.view",
    "master.view",
    "master.manage",
    "settings.view",
    "settings.manage",
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
  ],
  DOCTOR: [
    "patients.view",
    "visits.view", "visits.examine",
    "medical_records.view", "medical_records.create",
    "prescriptions.view",
    "medicines.view",
  ],
  NURSE: [
    "patients.view",
    "visits.view", "visits.triage",
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
    "billing.view",
    "payments.view", "payments.create",
    "patients.view",
    "visits.view",
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
