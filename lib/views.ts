import type { Todo } from "../types/todo";

export type ViewId = "today" | "upcoming" | "all" | "completed";

export type ClassifiedViews = Record<ViewId, Todo[]>;

/**
 * Returns the due-date status for a single todo relative to today.
 * Uses lexicographic YYYY-MM-DD string comparison — no Date objects (ADR-002).
 */
export function dueStatus(
  dueDate: string | undefined,
  today: string
): "overdue" | "today" | "upcoming" | "none" {
  if (!dueDate) return "none";
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

/**
 * Classifies todos into views. Subtasks (parentId set) are excluded from all views.
 * - today:     incomplete, dueDate <= today (includes overdue)
 * - upcoming:  incomplete, dueDate > today
 * - all:       all incomplete (regardless of dueDate)
 * - completed: all completed
 *
 * `today` must be a YYYY-MM-DD string supplied by the caller — never read the clock here.
 */
export function classify(todos: Todo[], today: string): ClassifiedViews {
  const topLevel = todos.filter((t) => !t.parentId);
  return {
    today: topLevel.filter(
      (t) => !t.completed && t.dueDate !== undefined && t.dueDate <= today
    ),
    upcoming: topLevel.filter(
      (t) => !t.completed && t.dueDate !== undefined && t.dueDate > today
    ),
    all: topLevel.filter((t) => !t.completed),
    completed: topLevel.filter((t) => t.completed),
  };
}
