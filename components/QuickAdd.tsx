"use client";

import { useState, useEffect, useRef } from "react";
import type { Priority, Tag } from "../types/todo";

export interface QuickAddDraft {
  title: string;
  dueDate?: string;
  priority: Priority;
  tags: Tag[];
}

interface QuickAddProps {
  open: boolean;
  onClose: () => void;
  /** Phase 2 will call onSubmit with a pre-filled draft from AI parsing. */
  onSubmit: (draft: QuickAddDraft) => void;
  /** Phase 2 can pass an initialDraft to pre-populate fields. */
  initialDraft?: Partial<QuickAddDraft>;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function QuickAdd({ open, onClose, onSubmit, initialDraft }: QuickAddProps) {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [dueDate, setDueDate] = useState(initialDraft?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(initialDraft?.priority ?? "medium");
  const [tagsRaw, setTagsRaw] = useState(initialDraft?.tags?.join(", ") ?? "");
  const [titleError, setTitleError] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initialDraft?.title ?? "");
      setDueDate(initialDraft?.dueDate ?? "");
      setPriority(initialDraft?.priority ?? "medium");
      setTagsRaw(initialDraft?.tags?.join(", ") ?? "");
      setTitleError(false);
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({ title: trimmed, dueDate: dueDate || undefined, priority, tags });
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick add task"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-[#141414] border border-neutral-800 p-6 space-y-4 animate-slide-up"
      >
        <h2 className="text-sm font-medium text-neutral-300">Quick Add</h2>

        <div>
          <input
            ref={titleRef}
            aria-label="Task title"
            placeholder="Task title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
            onKeyDown={handleTitleKeyDown}
            className={`w-full rounded-lg bg-neutral-900 border px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none ${
              titleError ? "border-red-500 focus:border-red-500" : "border-neutral-800 focus:border-neutral-600"
            }`}
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-400">Title is required.</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="qa-due" className="block text-xs text-neutral-500 mb-1">
              Due date
            </label>
            <input
              id="qa-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="qa-priority" className="block text-xs text-neutral-500 mb-1">
              Priority
            </label>
            <select
              id="qa-priority"
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

        <div>
          <label htmlFor="qa-tags" className="block text-xs text-neutral-500 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="qa-tags"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="work, personal, ..."
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-amber-500 text-black text-sm font-medium px-4 py-2 hover:bg-amber-400 transition-colors"
          >
            Add task
          </button>
          <button
            onClick={onClose}
            className="rounded-lg text-neutral-400 text-sm px-4 py-2 hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <span className="ml-auto text-xs text-neutral-600 self-center">
            ⌘K to open · Enter to add · Esc to close
          </span>
        </div>
      </div>
    </div>
  );
}
