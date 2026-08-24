import { Patient } from "@/types";

const STORAGE_KEY = "self-registered-patients";

/**
 * The mock patient "database" (services/index.ts) lives only in memory and resets on
 * every full page reload. A patient's login session (patientAuthStore) is persisted
 * to localStorage though, so without this, a returning patient's session would point
 * at a record that no longer exists. This mirrors self-registered patients into
 * localStorage so they can be restored into the mock dataset on the next app load.
 */
export function saveSelfRegisteredPatient(patient: Patient) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSelfRegisteredPatients();
    const next = [patient, ...existing.filter((p) => p.id !== patient.id)].slice(0, 200);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — registration still works for the current session.
  }
}

export function loadSelfRegisteredPatients(): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Patient[]) : [];
  } catch {
    return [];
  }
}
