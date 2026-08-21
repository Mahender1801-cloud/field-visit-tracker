import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatDuration(startIso: string, endIso: string | null) {
  const ms = (endIso ? new Date(endIso) : new Date()).getTime() - new Date(startIso).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

// "Today" in India, regardless of the server/browser's own timezone (Vercel
// runs in UTC, which is 5:30 behind IST — a plain toISOString().slice(0,10)
// gives yesterday's date for anyone in India before 5:30am).
export function istDateString(date: Date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// Same shift, exposed as a Date whose UTC getters read as IST wall-clock
// components — handy for day-of-week / month-start math.
export function toIST(date: Date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}
