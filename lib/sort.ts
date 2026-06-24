import type { Todo } from "../types/todo";

export type SortKey = "dueDate" | "priority" | "createdAt";
export type SortDirection = "asc" | "desc";

const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };

export function sortTodos(todos: Todo[], key: SortKey, direction: SortDirection): Todo[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...todos].sort((a, b) => {
    if (key === "dueDate") {
      const aDate = a.dueDate;
      const bDate = b.dueDate;
      if (aDate === undefined && bDate === undefined) return 0;
      if (aDate === undefined) return 1;
      if (bDate === undefined) return -1;
      return factor * (aDate < bDate ? -1 : aDate > bDate ? 1 : 0);
    }

    if (key === "priority") {
      const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return factor * diff;
    }

    // createdAt
    return factor * (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);
  });
}
