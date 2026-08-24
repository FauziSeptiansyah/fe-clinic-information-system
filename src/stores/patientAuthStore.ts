import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Patient } from "@/types";

interface PatientAuthState {
  patient: Patient | null;
  isAuthenticated: boolean;
  loginPatient: (patient: Patient) => void;
  logoutPatient: () => void;
}

/**
 * Separate from useAuthStore (staff/dashboard auth). Persisted to localStorage so a
 * patient's self-service session survives a page refresh — this is a frontend-only
 * mock (no real backend/hashing), matching the rest of this demo app's auth posture.
 */
export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      patient: null,
      isAuthenticated: false,
      loginPatient: (patient) => set({ patient, isAuthenticated: true }),
      logoutPatient: () => set({ patient: null, isAuthenticated: false }),
    }),
    { name: "patient-auth-storage", skipHydration: true }
  )
);
