import { reducer, type Action } from "./reducer";
import { record, undo, redo, type History } from "../lib/history";
import { emptyState } from "../persistence/storage";
import type { AppState } from "../types/todo";

export type HistoryAction = Action | { type: "undo" } | { type: "redo" };
export type AppHistory = History<AppState>;

export function historyReducer(history: AppHistory, action: HistoryAction): AppHistory {
  if (action.type === "undo") return undo(history);
  if (action.type === "redo") return redo(history);

  const next = reducer(history.present, action as Action);

  // hydrate replaces present without recording — undoing into an empty pre-load state is wrong
  if (action.type === "hydrate") {
    return { ...history, present: next };
  }

  return record(history, next);
}

export function emptyHistory(): AppHistory {
  return { past: [], present: emptyState(), future: [] };
}
