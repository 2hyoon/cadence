import type { Priority, Todo } from "../types/todo";

export interface FilterCriteria {
  query?: string;
  priority?: Priority;
  tag?: string;
}

export function filterTodos(todos: Todo[], criteria: FilterCriteria): Todo[] {
  const { query, priority, tag } = criteria;
  const q = query?.trim().toLowerCase();

  return todos.filter((todo) => {
    if (q) {
      const inTitle = todo.title.toLowerCase().includes(q);
      const inNotes = todo.notes?.toLowerCase().includes(q) ?? false;
      const inTags = todo.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inNotes && !inTags) return false;
    }
    if (priority && todo.priority !== priority) return false;
    if (tag && !todo.tags.includes(tag)) return false;
    return true;
  });
}
