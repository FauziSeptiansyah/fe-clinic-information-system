import { Permission } from "@/types";

/**
 * Maps dashboard route prefixes to the permission required to view them. Checked
 * against the current path (longest-prefix match) so both list and detail routes
 * under the same section (e.g. /patients and /patients/[id]) are covered by one
 * entry. A route with no matching entry (or an empty permissions array) is treated
 * as accessible to any authenticated staff member — e.g. the shared dashboard home
 * and the TV queue display.
 */
export const ROUTE_ACCESS: { prefix: string; permission: Permission }[] = [
  { prefix: "/registrations", permission: "registrations.create" },
  { prefix: "/patients/change-requests", permission: "patients.update" },
  { prefix: "/patients", permission: "patients.view" },
  { prefix: "/queues", permission: "queues.view" },
  { prefix: "/visits", permission: "visits.view" },
  { prefix: "/medical-records", permission: "medical_records.view" },
  { prefix: "/pharmacy", permission: "pharmacy.view" },
  { prefix: "/prescriptions", permission: "prescriptions.view" },
  { prefix: "/medicines", permission: "medicines.view" },
  { prefix: "/inventory", permission: "inventory.view" },
  { prefix: "/suppliers", permission: "suppliers.view" },
  { prefix: "/purchases", permission: "purchases.view" },
  { prefix: "/billing", permission: "billing.view" },
  { prefix: "/payments", permission: "payments.view" },
  { prefix: "/reports", permission: "reports.view" },
  { prefix: "/doctors", permission: "master.view" },
  { prefix: "/departments", permission: "master.view" },
  { prefix: "/services", permission: "master.view" },
  { prefix: "/procedures", permission: "master.view" },
  { prefix: "/payers", permission: "master.view" },
  { prefix: "/users", permission: "master.manage" },
  { prefix: "/settings/roles", permission: "settings.manage" },
  { prefix: "/settings", permission: "settings.view" },
];

/** Longest-prefix match so a more specific rule (e.g. /settings/roles) wins over a general one (/settings). */
export function getRequiredPermission(pathname: string): Permission | null {
  let best: { prefix: string; permission: Permission } | null = null;
  for (const rule of ROUTE_ACCESS) {
    if (pathname === rule.prefix || pathname.startsWith(rule.prefix + "/")) {
      if (!best || rule.prefix.length > best.prefix.length) best = rule;
    }
  }
  return best ? best.permission : null;
}
