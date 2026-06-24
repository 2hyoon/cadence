"use client";

import { useState, useEffect } from "react";
import { useTodos } from "../store/TodoProvider";
import { classify, type ViewId } from "../lib/views";
import { Sidebar } from "../components/Sidebar";
import { TaskListContainer } from "./TaskListContainer";
import { QuickAdd, type QuickAddDraft } from "../components/QuickAdd";
import type { Todo } from "../types/todo";
import { StatsView } from "./StatsView";

type AnyViewId = ViewId | "stats";

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeSampleTodos(today: string): Omit<Todo, "id" | "createdAt">[] {
  const tomorrow = (() => {
    const d = new Date(today + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();
  return [
    {
      title: "Try completing a task",
      priority: "medium",
      tags: [],
      completed: false,
      dueDate: today,
    },
    {
      title: "Add a recurring habit",
      priority: "low",
      tags: [],
      completed: false,
      dueDate: tomorrow,
    },
    {
      title: "Break a goal into subtasks",
      priority: "high",
      tags: [],
      completed: false,
    },
  ];
}

const VIEW_LABELS: Record<AnyViewId, string> = {
  today: "Today",
  upcoming: "Upcoming",
  all: "All",
  completed: "Completed",
  stats: "Stats",
};

export function AppShell() {
  const { state, dispatch, hydrated } = useTodos();
  const [activeView, setActiveView] = useState<AnyViewId>("today");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const VIEW_KEYS: Record<string, AnyViewId> = {
    "1": "today",
    "2": "upcoming",
    "3": "all",
    "4": "completed",
    "5": "stats",
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setQuickAddOpen((prev) => !prev);
      }
      if (e.key.toLowerCase() === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "undo" });
      }
      if (
        (e.key.toLowerCase() === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) ||
        (e.key.toLowerCase() === "y" && e.ctrlKey)
      ) {
        e.preventDefault();
        dispatch({ type: "redo" });
      }

      // Number keys 1-5: switch views (only when no input is focused)
      const tag = (e.target as HTMLElement).tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        const view = VIEW_KEYS[e.key];
        if (view) setActiveView(view);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  function handleQuickAddSubmit(draft: QuickAddDraft) {
    dispatch({
      type: "add",
      payload: {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completed: false,
        tags: draft.tags,
      },
    });
  }

  const today = getTodayString();
  const views = classify(state.todos, today);
  const topLevelTodos = state.todos.filter((t) => !t.parentId);
  const isEmpty = hydrated && topLevelTodos.length === 0;

  function handleAddSamples() {
    const samples = makeSampleTodos(today);
    for (const sample of samples) {
      dispatch({
        type: "add",
        payload: {
          ...sample,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      });
    }
  }

  const currentList: Todo[] =
    activeView === "stats" ? [] : views[activeView as ViewId];

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1c1c1c] flex flex-col">
      <div className="flex-1 flex max-w-5xl w-full mx-auto px-4 py-8 gap-8">
        <Sidebar activeView={activeView} onSelect={setActiveView} />

        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          <h1 className="text-2xl font-semibold text-[#1c1c1c] mb-6">
            {VIEW_LABELS[activeView]}
          </h1>

          {/* Pre-hydration skeleton */}
          {!hydrated && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[#f7f4ed] border border-[#eceae4] p-4 h-12 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty state / onboarding */}
          {hydrated && isEmpty && (
            <div className="rounded-lg bg-[#f7f4ed] border border-[#eceae4] p-8 text-center">
              <p className="text-[#1c1c1c] text-sm mb-1">No tasks yet.</p>
              <p className="text-[#5f5f5d] text-sm mb-6">
                Add your first task, or start with a few samples.
              </p>
              <button
                onClick={handleAddSamples}
                className="rounded-md bg-[#1c1c1c] text-[#fcfbf8] text-sm font-medium px-4 py-2 btn-inset transition-opacity"
              >
                Add sample tasks
              </button>
            </div>
          )}

          {/* View content */}
          {hydrated && activeView !== "stats" && (
            <TaskListContainer todos={currentList} today={today} />
          )}

          {/* Stats dashboard */}
          {hydrated && activeView === "stats" && (
            <StatsView state={state} today={today} />
          )}
        </main>
      </div>
      <QuickAdd
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSubmit={handleQuickAddSubmit}
      />
    </div>
  );
}
