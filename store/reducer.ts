import type { AppState, CompletionLogEntry, Todo } from "../types/todo";
import { nextDueDate } from "../lib/recurrence";

export type Action =
  | { type: "add"; payload: Todo }
  | { type: "edit"; payload: { id: string } & Partial<Omit<Todo, "id">> }
  | { type: "toggle"; payload: { id: string; date?: string } }
  | { type: "delete"; payload: { id: string } }
  | { type: "hydrate"; payload: AppState };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "add":
      return { ...state, todos: [...state.todos, action.payload] };

    case "edit": {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo
        ),
      };
    }

    case "toggle": {
      const todo = state.todos.find((t) => t.id === action.payload.id);
      if (!todo) return state;

      // Recurring completion: roll forward in place, log the occurrence
      if (!todo.completed && todo.recurrence && todo.seriesId) {
        const occurrenceDate = todo.dueDate ?? action.payload.date ?? "";
        const entry: CompletionLogEntry = { seriesId: todo.seriesId, date: occurrenceDate };
        const rolled = nextDueDate(occurrenceDate, todo.recurrence.preset);
        return {
          ...state,
          todos: state.todos.map((t) =>
            t.id === todo.id ? { ...t, dueDate: rolled, completed: false } : t
          ),
          completionLog: [...state.completionLog, entry],
        };
      }

      // Normal toggle
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? { ...t, completed: !t.completed } : t
        ),
      };
    }

    case "delete":
      return {
        ...state,
        todos: state.todos.filter(
          (todo) =>
            todo.id !== action.payload.id &&
            todo.parentId !== action.payload.id
        ),
      };

    case "hydrate":
      return action.payload;

    default:
      return state;
  }
}
