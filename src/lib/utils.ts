import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInYears } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: string | Date | null | undefined, pattern: string = "dd MMMM yyyy"): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern, { locale: idLocale });
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || isNaN(Number(num))) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

export function calculateAge(birthDate: string | Date | null | undefined): number {
  if (!birthDate) return 0;
  try {
    const d = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    return differenceInYears(new Date(), d);
  } catch {
    return 0;
  }
}

export function generateId(prefix: string = "ID"): string {
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}${randomStr}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
