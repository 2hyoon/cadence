import type { AppState, CompletionLogEntry } from "../types/todo";

export interface DayCount {
  date: string;
  count: number;
}

/**
 * Stats shape returned by computeStats.
 * - completionRate: ratio of completed top-level todos to total top-level todos (0–1).
 *   "Done" counts todos with completed=true at query time.
 * - recentDays: per-day completion counts from completionLog for the last `windowDays` days
 *   (inclusive of today, exclusive before windowStart).
 * - recentTotal: sum of counts in recentDays.
 * - windowDays: the window size used.
 */
export interface Stats {
  completionRate: number;
  completedCount: number;
  totalCount: number;
  recentDays: DayCount[];
  recentTotal: number;
  windowDays: number;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Pure aggregation over AppState.
 * @param state  Current app state.
 * @param today  YYYY-MM-DD string for the current day (caller supplies — never read the clock here).
 * @param windowDays  Number of days to look back for recent completions (default 7).
 */
export function computeStats(state: AppState, today: string, windowDays = 7): Stats {
  const topLevel = state.todos.filter((t) => !t.parentId);
  const total = topLevel.length;
  const completed = topLevel.filter((t) => t.completed).length;
  const completionRate = total === 0 ? 0 : completed / total;

  const windowStart = addDays(today, -(windowDays - 1));

  const countByDate: Record<string, number> = {};
  for (const entry of state.completionLog) {
    if (entry.date >= windowStart && entry.date <= today) {
      countByDate[entry.date] = (countByDate[entry.date] ?? 0) + 1;
    }
  }

  const recentDays: DayCount[] = [];
  for (let i = 0; i < windowDays; i++) {
    const date = addDays(windowStart, i);
    recentDays.push({ date, count: countByDate[date] ?? 0 });
  }

  const recentTotal = recentDays.reduce((sum, d) => sum + d.count, 0);

  return {
    completionRate,
    completedCount: completed,
    totalCount: total,
    recentDays,
    recentTotal,
    windowDays,
  };
}

export function recentCompletions(
  completionLog: CompletionLogEntry[],
  today: string,
  windowDays = 7
): DayCount[] {
  const windowStart = addDays(today, -(windowDays - 1));
  const countByDate: Record<string, number> = {};
  for (const entry of completionLog) {
    if (entry.date >= windowStart && entry.date <= today) {
      countByDate[entry.date] = (countByDate[entry.date] ?? 0) + 1;
    }
  }
  const days: DayCount[] = [];
  for (let i = 0; i < windowDays; i++) {
    const date = addDays(windowStart, i);
    days.push({ date, count: countByDate[date] ?? 0 });
  }
  return days;
}
