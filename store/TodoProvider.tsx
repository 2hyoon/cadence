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
import { loadState, saveState } from "../persistence/storage";
import { historyReducer, emptyHistory, type HistoryAction } from "./historyReducer";

interface TodoContextValue {
  state: AppState;
  dispatch: React.Dispatch<HistoryAction>;
  hydrated: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, undefined, emptyHistory);
  const [hydrated, setHydrated] = useState(false);

  // Client-only hydration — never during render to avoid SSR/client markup mismatch
  useEffect(() => {
    dispatch({ type: "hydrate", payload: loadState() });
    setHydrated(true);
  }, []);

  // Persist only the present state (not the full history) to keep storage shape as AppState
  useEffect(() => {
    if (!hydrated) return;
    saveState(history.present);
  }, [history.present, hydrated]);

  return (
    <TodoContext.Provider
      value={{
        state: history.present,
        dispatch,
        hydrated,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
      }}
    >
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
