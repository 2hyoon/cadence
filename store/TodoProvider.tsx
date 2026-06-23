"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { AppState } from "../types/todo";
import { emptyState, loadState, saveState } from "../persistence/storage";
import { reducer, type Action } from "./reducer";

interface TodoContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [hydrated, setHydrated] = useState(false);

  // Client-only hydration — never during render to avoid SSR/client markup mismatch
  useEffect(() => {
    dispatch({ type: "hydrate", payload: loadState() });
    setHydrated(true);
  }, []);

  // Persist on every state change, but only after initial hydration
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  return (
    <TodoContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (ctx === null) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return ctx;
}
