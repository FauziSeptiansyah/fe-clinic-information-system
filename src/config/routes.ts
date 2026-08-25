export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    KIOSK: "/kiosk",
  },
  PATIENT: {
    DASHBOARD: "/patient/dashboard",
    QUEUE: "/patient/queue",
    HISTORY: "/patient/history",
    PROFILE: "/patient/profile",
  },
  DASHBOARD: "/dashboard",
  PATIENTS: {
    LIST: "/patients",
    NEW: "/patients/new",
    DETAIL: (id: string) => `/patients/${id}`,
    EDIT: (id: string) => `/patients/${id}/edit`,
    CHANGE_REQUESTS: "/patients/change-requests",
  },
  REGISTRATIONS: {
    LIST: "/registrations",
    NEW: "/registrations/new",
  },
  QUEUES: {
    LIST: "/queues",
    DISPLAY: "/queue-display",
    RECEIVE: (id: string) => `/queues/${id}/receive`,
  },
  NURSE: {
    LIST: "/nurse",
    DETAIL: (id: string) => `/nurse/${id}`,
  },
  VISITS: {
    LIST: "/visits",
    DETAIL: (id: string) => `/visits/${id}`,
  },
  MEDICAL_RECORDS: {
    LIST: "/medical-records",
    DETAIL: (id: string) => `/medical-records/${id}`,
  },
  PRESCRIPTIONS: {
    LIST: "/prescriptions",
    DETAIL: (id: string) => `/prescriptions/${id}`,
  },
  PHARMACY: "/pharmacy",
  MEDICINES: {
    LIST: "/medicines",
    NEW: "/medicines/new",
    DETAIL: (id: string) => `/medicines/${id}`,
    EDIT: (id: string) => `/medicines/${id}/edit`,
  },
  INVENTORY: {
    LIST: "/inventory",
    MOVEMENTS: "/inventory/movements",
  },
  SUPPLIERS: "/suppliers",
  PURCHASES: {
    LIST: "/purchases",
    NEW: "/purchases/new",
    DETAIL: (id: string) => `/purchases/${id}`,
  },
  BILLING: {
    LIST: "/billing",
    DETAIL: (id: string) => `/billing/${id}`,
  },
  PAYMENTS: "/payments",
  REPORTS: {
    PATIENTS: "/reports/patients",
    VISITS: "/reports/visits",
    REVENUE: "/reports/revenue",
    PHARMACY: "/reports/pharmacy",
    INVENTORY: "/reports/inventory",
  },
  MASTER: {
    DOCTORS: "/doctors",
    DEPARTMENTS: "/departments",
    SERVICES: "/services",
    PROCEDURES: "/procedures",
    PAYERS: "/payers",
    USERS: "/users",
  },
  SETTINGS: {
    INDEX: "/settings",
    CLINIC: "/settings/clinic",
    ROLES: "/settings/roles",
    AUDIT_LOGS: "/settings/audit-logs",
  },
  ERRORS: {
    FORBIDDEN: "/403",
    NOT_FOUND: "/404",
  },
} as const;
