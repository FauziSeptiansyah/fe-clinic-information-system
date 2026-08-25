import { PatientChangeRequest } from "@/types";

const STORAGE_KEY = "patient-change-requests";

/**
 * Same rationale as selfRegisteredPatients.ts: the mock "database" is in-memory per tab,
 * but a change request is inherently created by a patient (their own device/session) and
 * reviewed by staff (a different device/session) — without this, staff would never see
 * what a patient just submitted.
 */
export function savePendingChangeRequests(list: PatientChangeRequest[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    // localStorage unavailable — request still works for the current tab's session.
  }
}

export function loadPersistedChangeRequests(): PatientChangeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PatientChangeRequest[]) : [];
  } catch {
    return [];
  }
}
