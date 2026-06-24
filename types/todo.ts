export type Priority = "low" | "medium" | "high";

export type Tag = string;

export type RecurrencePreset = "daily" | "weekly" | "monthly";

export interface RecurrenceRule {
  preset: RecurrencePreset;
}

export interface Todo {
  id: string;
  title: string;
  notes?: string;
  /** date-only YYYY-MM-DD */
  dueDate?: string;
  priority: Priority;
  tags: Tag[];
  completed: boolean;
  /** present on subtasks; flat, one level deep */
  parentId?: string;
  /** present on recurring tasks; groups completions in the log */
  seriesId?: string;
  recurrence?: RecurrenceRule;
  /** ISO timestamp for creation-time ordering */
  createdAt: string;
}

export interface CompletionLogEntry {
  seriesId: string;
  /** date-only YYYY-MM-DD */
  date: string;
}

export interface AppState {
  todos: Todo[];
  completionLog: CompletionLogEntry[];
}

const PRIORITIES = new Set<string>(["low", "medium", "high"]);
const RECURRENCE_PRESETS = new Set<string>(["daily", "weekly", "monthly"]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isRecurrenceRule(v: unknown): v is RecurrenceRule {
  return isObject(v) && typeof v.preset === "string" && RECURRENCE_PRESETS.has(v.preset);
}

export function isTodo(value: unknown): value is Todo {
  if (!isObject(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.title !== "string") return false;
  if (value.notes !== undefined && typeof value.notes !== "string") return false;
  if (value.dueDate !== undefined && typeof value.dueDate !== "string") return false;
  if (typeof value.priority !== "string" || !PRIORITIES.has(value.priority)) return false;
  if (!Array.isArray(value.tags) || !value.tags.every((t) => typeof t === "string")) return false;
  if (typeof value.completed !== "boolean") return false;
  if (value.parentId !== undefined && typeof value.parentId !== "string") return false;
  if (value.seriesId !== undefined && typeof value.seriesId !== "string") return false;
  if (value.recurrence !== undefined && !isRecurrenceRule(value.recurrence)) return false;
  if (typeof value.createdAt !== "string") return false;
  return true;
}

function isCompletionLogEntry(value: unknown): value is CompletionLogEntry {
  return isObject(value) && typeof value.seriesId === "string" && typeof value.date === "string";
}

export function isAppState(value: unknown): value is AppState {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.todos) || !value.todos.every(isTodo)) return false;
  if (!Array.isArray(value.completionLog) || !value.completionLog.every(isCompletionLogEntry)) return false;
  return true;
}
