import type { Todo } from "../types/todo";

export interface SubtaskProgress {
  total: number;
  done: number;
  percent: number;
}

export function subtaskProgress(parentId: string, todos: Todo[]): SubtaskProgress {
  const subtasks = todos.filter((t) => t.parentId === parentId);
  const total = subtasks.length;
  if (total === 0) return { total: 0, done: 0, percent: 0 };
  const done = subtasks.filter((t) => t.completed).length;
  return { total, done, percent: Math.round((done / total) * 100) };
}
