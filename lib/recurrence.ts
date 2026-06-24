import type { RecurrencePreset } from "../types/todo";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toYMD(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Returns the next occurrence date for a recurring task.
 * Uses UTC arithmetic to avoid timezone/DST drift (ADR-002).
 * monthly clamps to the last valid day of the target month (e.g. Jan 31 → Feb 28/29).
 */
export function nextDueDate(dueDate: string, preset: RecurrencePreset): string {
  const [y, m, d] = dueDate.split("-").map(Number);

  if (preset === "daily") {
    return toYMD(Date.UTC(y, m - 1, d + 1));
  }

  if (preset === "weekly") {
    return toYMD(Date.UTC(y, m - 1, d + 7));
  }

  // monthly: advance 1 month, clamp day to last valid day of target month
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  // Date.UTC(nextYear, nextMonth, 0) = last day of nextMonth (1-indexed)
  const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
  const clampedDay = Math.min(d, daysInNextMonth);
  return `${nextYear}-${pad(nextMonth)}-${pad(clampedDay)}`;
}
