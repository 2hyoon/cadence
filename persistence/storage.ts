import { isAppState } from "../types/todo";
import type { AppState } from "../types/todo";

export const STORAGE_KEY = "cadence_state";
export const STORAGE_VERSION = 1;

export function emptyState(): AppState {
  return { todos: [], completionLog: [] };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyState();
    const envelope = JSON.parse(raw) as unknown;
    if (
      typeof envelope !== "object" ||
      envelope === null ||
      (envelope as Record<string, unknown>).version !== STORAGE_VERSION
    ) {
      return emptyState();
    }
    const state = (envelope as Record<string, unknown>).state;
    if (!isAppState(state)) return emptyState();
    return state;
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
  } catch {
    // absorb quota-exceeded and other storage errors
  }
}
