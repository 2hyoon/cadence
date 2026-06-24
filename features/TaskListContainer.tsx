"use client";

import { useState, useRef, useEffect } from "react";
import { useTodos } from "../store/TodoProvider";
import { TaskList } from "../components/TaskList";
import { TaskDetail } from "../components/TaskDetail";
import { filterTodos, type FilterCriteria } from "../lib/filter";
import { sortTodos, type SortKey, type SortDirection } from "../lib/sort";
import { subtaskProgress } from "../lib/progress";
import type { Priority, Todo } from "../types/todo";

interface TaskListContainerProps {
  todos: Todo[];
  today: string;
}

export function TaskListContainer({ todos, today }: TaskListContainerProps) {
  const { state, dispatch } = useTodos();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");
  const [addParsing, setAddParsing] = useState(false);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  const selectedTodo = selectedId ? state.todos.find((t) => t.id === selectedId) : null;
  const selectedSubtasks = selectedTodo
    ? state.todos.filter((t) => t.parentId === selectedTodo.id)
    : [];

  function handleToggle(id: string) {
    const todo = state.todos.find((t) => t.id === id);
    dispatch({ type: "toggle", payload: { id, date: today } });
    if (todo && !todo.completed) {
      showToast("Task completed");
    }
  }

  function handleEdit(id: string, updates: Partial<Omit<Todo, "id">>) {
    dispatch({ type: "edit", payload: { id, ...updates } });
  }

  function handleDelete(id: string) {
    dispatch({ type: "delete", payload: { id } });
    if (selectedId === id) setSelectedId(null);
    showToast("Task deleted");
  }

  function handleAddSubtask(parentId: string, title: string) {
    dispatch({
      type: "add",
      payload: {
        id: crypto.randomUUID(),
        title,
        priority: "medium",
        tags: [],
        completed: false,
        parentId,
        createdAt: new Date().toISOString(),
      },
    });
  }

  function handleAdd(title: string) {
    dispatch({
      type: "add",
      payload: {
        id: crypto.randomUUID(),
        title,
        priority: "medium",
        tags: [],
        completed: false,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && addValue.trim() && !addParsing) {
      const text = addValue.trim();
      setAddValue("");
      setAddParsing(true);
      try {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const draft = await res.json() as { title?: string; dueDate?: string; priority?: Priority; tags?: string[] };
          dispatch({
            type: "add",
            payload: {
              id: crypto.randomUUID(),
              title: draft.title || text,
              priority: draft.priority ?? "medium",
              tags: draft.tags ?? [],
              completed: false,
              dueDate: draft.dueDate,
              createdAt: new Date().toISOString(),
            },
          });
        } else {
          handleAdd(text);
        }
      } catch {
        handleAdd(text);
      } finally {
        setAddParsing(false);
      }
    } else if (e.key === "Escape") {
      setAddValue("");
    }
  }

  // Only show top-level tasks in the main list; subtasks are shown in TaskDetail
  const parentTodos = todos.filter((t) => !t.parentId);

  const criteria: FilterCriteria = {
    query: query || undefined,
    priority: priorityFilter || undefined,
  };
  const displayTodos = sortTodos(filterTodos(parentTodos, criteria), sortKey, sortDir);

  const subtaskProgressMap: Record<string, ReturnType<typeof subtaskProgress>> = {};
  for (const todo of displayTodos) {
    subtaskProgressMap[todo.id] = subtaskProgress(todo.id, state.todos);
  }

  return (
    <div className="space-y-3">
      {/* Search / filter / sort bar */}
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Search tasks"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-0 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
        <select
          aria-label="Filter by priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          aria-label="Sort by"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
        >
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="createdAt">Created</option>
        </select>
        <button
          aria-label={sortDir === "asc" ? "Sort ascending" : "Sort descending"}
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-300 focus:outline-none"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {displayTodos.length === 0 && parentTodos.length > 0 ? (
        <p className="text-neutral-500 text-sm">No tasks match your filters.</p>
      ) : displayTodos.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nothing here.</p>
      ) : (
        <TaskList
          todos={displayTodos}
          today={today}
          subtaskProgressMap={subtaskProgressMap}
          onToggle={handleToggle}
          onSelect={setSelectedId}
          onDelete={handleDelete}
        />
      )}

      <input
        aria-label="New task"
        placeholder={addParsing ? "Parsing…" : "Add a task…"}
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        onKeyDown={handleAddKeyDown}
        disabled={addParsing}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none disabled:opacity-50"
      />

      {selectedTodo && (
        <TaskDetail
          todo={selectedTodo}
          subtasks={selectedSubtasks}
          onSave={(updates) => handleEdit(selectedTodo.id, updates)}
          onClose={() => setSelectedId(null)}
          onDelete={() => handleDelete(selectedTodo.id)}
          onAddSubtask={(title) => handleAddSubtask(selectedTodo.id, title)}
          onToggleSubtask={handleToggle}
          onDeleteSubtask={handleDelete}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-300 shadow-lg animate-slide-up"
        >
          <span>{toast}</span>
          <button
            onClick={() => {
              dispatch({ type: "undo" });
              setToast(null);
            }}
            className="text-amber-500 hover:text-amber-400 font-medium"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
