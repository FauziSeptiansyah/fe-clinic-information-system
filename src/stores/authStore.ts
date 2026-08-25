import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Role, Permission } from "@/types";
import { ROLE_PERMISSIONS, hasPermission } from "@/config/permissionConfig";

export const MOCK_USERS: User[] = [
  {
    id: "usr-admin-1",
    name: "Dr. Hendra Wijaya, Sp.A (Admin)",
    email: "admin@kliniksehat.co.id",
    role: "ADMIN",
    phone: "081234567890",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-owner-1",
    name: "Bpk. Rahmat Santoso (Owner)",
    email: "owner@kliniksehat.co.id",
    role: "OWNER",
    phone: "081234567891",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-recep-1",
    name: "Siti Rahmawati (Resepsionis)",
    email: "resepsionis@kliniksehat.co.id",
    role: "RECEPTIONIST",
    phone: "081234567892",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-doc-1",
    name: "dr. Fauzi Ahmad, Sp.PD (Dokter)",
    email: "dokter@kliniksehat.co.id",
    role: "DOCTOR",
    phone: "081234567893",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-nurse-1",
    name: "Ns. Maya Indah, S.Kep (Perawat)",
    email: "perawat@kliniksehat.co.id",
    role: "NURSE",
    phone: "081234567894",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-pharm-1",
    name: "apt. Dimas Pratama, S.Farm (Apoteker)",
    email: "apoteker@kliniksehat.co.id",
    role: "PHARMACIST",
    phone: "081234567895",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-cash-1",
    name: "Rina Kusuma (Kasir)",
    email: "kasir@kliniksehat.co.id",
    role: "CASHIER",
    phone: "081234567896",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr-wh-1",
    name: "Budi Santoso (Gudang Farmasi)",
    email: "gudang@kliniksehat.co.id",
    role: "WAREHOUSE",
    phone: "081234567897",
    status: "ACTIVE",
    lastLogin: new Date().toISOString(),
  },
];

interface AuthState {
  user: User | null;
  role: Role | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  login: (email: string, roleOverride?: Role) => boolean;
  switchRole: (role: Role) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

// Persisted (like patientAuthStore) so a deliberate role switch — e.g. while testing RBAC —
// survives a reload or a fresh tab instead of silently resetting to Admin. A truly first-ever
// visit (nothing in localStorage yet) still starts logged in as Admin for easy testing.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: MOCK_USERS[0], // Default logged in as Admin for easy testing
  role: "ADMIN",
  permissions: ROLE_PERMISSIONS["ADMIN"],
  isAuthenticated: true,

  login: (email: string, roleOverride?: Role) => {
    let matchedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (roleOverride) {
      matchedUser = MOCK_USERS.find((u) => u.role === roleOverride) || matchedUser;
    }
    if (!matchedUser) {
      matchedUser = {
        id: "usr-custom",
        name: email.split("@")[0],
        email: email,
        role: roleOverride || "ADMIN",
        status: "ACTIVE",
        lastLogin: new Date().toISOString(),
      };
    }
    const role = matchedUser.role;
    const permissions = ROLE_PERMISSIONS[role] || [];
    set({
      user: matchedUser,
      role: role,
      permissions: permissions,
      isAuthenticated: true,
    });
    return true;
  },

  switchRole: (role: Role) => {
    const matchedUser = MOCK_USERS.find((u) => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: `Pengguna (${role})`,
      email: `${role.toLowerCase()}@kliniksehat.co.id`,
      role: role,
      status: "ACTIVE" as const,
      lastLogin: new Date().toISOString(),
    };
    set({
      user: matchedUser,
      role: role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
  },

  can: (permission: Permission) => {
    const { role } = get();
    return hasPermission(role || undefined, permission);
  },
    }),
    { name: "staff-auth-storage", skipHydration: true }
  )
);
