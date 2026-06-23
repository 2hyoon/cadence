import type { AppState, Todo } from "../types/todo";

export type Action =
  | { type: "add"; payload: Todo }
  | { type: "edit"; payload: { id: string } & Partial<Omit<Todo, "id">> }
  | { type: "toggle"; payload: { id: string } }
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

    case "toggle":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

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
