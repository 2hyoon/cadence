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

const inputClass =
  "w-full rounded-md bg-[#f7f4ed] border border-[#eceae4] px-4 py-3 text-sm text-[#1c1c1c] placeholder-[#5f5f5d] input-ring";

export function QuickAdd({ open, onClose, onSubmit, initialDraft }: QuickAddProps) {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [dueDate, setDueDate] = useState(initialDraft?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(initialDraft?.priority ?? "medium");
  const [tagsRaw, setTagsRaw] = useState(initialDraft?.tags?.join(", ") ?? "");
  const [titleError, setTitleError] = useState(false);
  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlNotice, setNlNotice] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initialDraft?.title ?? "");
      setDueDate(initialDraft?.dueDate ?? "");
      setPriority(initialDraft?.priority ?? "medium");
      setTagsRaw(initialDraft?.tags?.join(", ") ?? "");
      setTitleError(false);
      setNlText("");
      setNlLoading(false);
      setNlNotice(null);
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleParse() {
    const text = nlText.trim();
    if (!text || nlLoading) return;
    setNlLoading(true);
    setNlNotice(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("parse failed");
      const draft = (await res.json()) as Partial<QuickAddDraft>;
      if (draft.title) setTitle(draft.title);
      if (draft.dueDate) setDueDate(draft.dueDate);
      if (draft.priority) setPriority(draft.priority);
      if (Array.isArray(draft.tags) && draft.tags.length > 0)
        setTagsRaw(draft.tags.join(", "));
      setTimeout(() => titleRef.current?.focus(), 0);
    } catch {
      setNlNotice("AI parsing unavailable — fill in the fields below.");
    } finally {
      setNlLoading(false);
    }
  }

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
        className="absolute inset-0 bg-[#1c1c1c]/20"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#f7f4ed] border border-[#eceae4] p-6 space-y-4 animate-slide-up">
        <h2 className="text-sm font-medium text-[#1c1c1c]">Quick Add</h2>

        <div>
          <div className="flex gap-2">
            <input
              aria-label="Describe task naturally"
              placeholder="Describe task naturally (AI)"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleParse();
                }
              }}
              disabled={nlLoading}
              className="flex-1 rounded-md bg-[#f7f4ed] border border-[#eceae4] px-4 py-3 text-sm text-[#1c1c1c] placeholder-[#5f5f5d] input-ring disabled:opacity-50"
            />
            <button
              onClick={handleParse}
              disabled={nlLoading || !nlText.trim()}
              className="rounded-md border border-[rgba(28,28,28,0.4)] text-[#1c1c1c] text-sm px-3 py-2 hover:bg-[rgba(28,28,28,0.04)] disabled:opacity-40 transition-colors"
            >
              {nlLoading ? "Parsing..." : "Parse"}
            </button>
          </div>
          {nlNotice && (
            <p className="mt-1 text-xs text-[#5f5f5d]">{nlNotice}</p>
          )}
        </div>

        <div>
          <input
            ref={titleRef}
            aria-label="Task title"
            placeholder="Task title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
            onKeyDown={handleTitleKeyDown}
            className={`w-full rounded-md bg-[#f7f4ed] border px-4 py-3 text-sm text-[#1c1c1c] placeholder-[#5f5f5d] input-ring ${
              titleError ? "border-red-500" : "border-[#eceae4]"
            }`}
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-500">Title is required.</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="qa-due" className="block text-xs text-[#5f5f5d] mb-1">
              Due date
            </label>
            <input
              id="qa-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex-1">
            <label htmlFor="qa-priority" className="block text-xs text-[#5f5f5d] mb-1">
              Priority
            </label>
            <select
              id="qa-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={inputClass}
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
          <label htmlFor="qa-tags" className="block text-xs text-[#5f5f5d] mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="qa-tags"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="work, personal, ..."
            className={inputClass}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-[#1c1c1c] text-[#fcfbf8] text-sm font-medium px-4 py-2 btn-inset transition-opacity"
          >
            Add task
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-[rgba(28,28,28,0.4)] text-[#1c1c1c] text-sm px-4 py-2 hover:bg-[rgba(28,28,28,0.04)] transition-colors"
          >
            Cancel
          </button>
          <span className="ml-auto text-xs text-[rgba(28,28,28,0.4)] self-center">
            ⌘K to open · Enter to add · Esc to close
          </span>
        </div>
      </div>
    </div>
  );
}
