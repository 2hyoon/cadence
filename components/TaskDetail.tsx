"use client";

import { useState, useEffect, useRef } from "react";
import type { Priority, Todo } from "../types/todo";

interface TaskDetailProps {
  todo: Todo;
  onSave: (updates: Partial<Omit<Todo, "id">>) => void;
  onClose: () => void;
  onDelete: () => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function TaskDetail({ todo, onSave, onClose, onDelete }: TaskDetailProps) {
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes ?? "");
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({
      title: trimmed,
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
    });
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Task detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-lg bg-[#141414] border border-neutral-800 p-6 space-y-4">
        <div>
          <label htmlFor="detail-title" className="block text-xs text-neutral-500 mb-1">
            Title
          </label>
          <input
            id="detail-title"
            ref={titleRef}
            aria-label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="detail-notes" className="block text-xs text-neutral-500 mb-1">
            Notes
          </label>
          <textarea
            id="detail-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="detail-due" className="block text-xs text-neutral-500 mb-1">
              Due date
            </label>
            <input
              id="detail-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="detail-priority" className="block text-xs text-neutral-500 mb-1">
              Priority
            </label>
            <select
              id="detail-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="rounded-lg bg-amber-500 text-black text-sm font-medium px-4 py-2 hover:bg-amber-400 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded-lg text-neutral-400 text-sm px-4 py-2 hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="ml-auto rounded-lg text-neutral-500 text-sm px-4 py-2 hover:text-red-400 transition-colors"
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
