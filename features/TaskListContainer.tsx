"use client";

import { useState } from "react";
import { useTodos } from "../store/TodoProvider";
import { TaskList } from "../components/TaskList";
import { TaskDetail } from "../components/TaskDetail";
import type { Todo } from "../types/todo";

interface TaskListContainerProps {
  todos: Todo[];
  today: string;
}

export function TaskListContainer({ todos, today }: TaskListContainerProps) {
  const { state, dispatch } = useTodos();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");

  const selectedTodo = selectedId ? state.todos.find((t) => t.id === selectedId) : null;

  function handleToggle(id: string) {
    dispatch({ type: "toggle", payload: { id } });
  }

  function handleEdit(id: string, updates: Partial<Omit<Todo, "id">>) {
    dispatch({ type: "edit", payload: { id, ...updates } });
  }

  function handleDelete(id: string) {
    dispatch({ type: "delete", payload: { id } });
    if (selectedId === id) setSelectedId(null);
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

  function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && addValue.trim()) {
      handleAdd(addValue.trim());
      setAddValue("");
    } else if (e.key === "Escape") {
      setAddValue("");
    }
  }

  return (
    <div className="space-y-3">
      {todos.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nothing here.</p>
      ) : (
        <TaskList
          todos={todos}
          today={today}
          onToggle={handleToggle}
          onSelect={setSelectedId}
          onDelete={handleDelete}
        />
      )}

      <input
        aria-label="New task"
        placeholder="Add a task..."
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        onKeyDown={handleAddKeyDown}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
      />

      {selectedTodo && (
        <TaskDetail
          todo={selectedTodo}
          onSave={(updates) => handleEdit(selectedTodo.id, updates)}
          onClose={() => setSelectedId(null)}
          onDelete={() => handleDelete(selectedTodo.id)}
        />
      )}
    </div>
  );
}
