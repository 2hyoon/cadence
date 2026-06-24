"use client";

import { useState, useEffect, useRef } from "react";
import type { Priority, RecurrencePreset, Todo } from "../types/todo";
import { subtaskProgress } from "../lib/progress";

interface TaskDetailProps {
  todo: Todo;
  subtasks: Todo[];
  onSave: (updates: Partial<Omit<Todo, "id">>) => void;
  onClose: () => void;
  onDelete: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function TaskDetail({
  todo,
  subtasks,
  onSave,
  onClose,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskDetailProps) {
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes ?? "");
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [recurrencePreset, setRecurrencePreset] = useState<RecurrencePreset | "">(
    todo.recurrence?.preset ?? ""
  );
  const [subtaskInput, setSubtaskInput] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const progress = subtaskProgress(todo.id, subtasks);
  const isSubtask = !!todo.parentId;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const recurrence = recurrencePreset ? { preset: recurrencePreset } : undefined;
    const seriesId =
      recurrencePreset && !todo.seriesId ? crypto.randomUUID() : todo.seriesId;
    onSave({
      title: trimmed,
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      recurrence,
      seriesId,
    });
    onClose();
  }

  function handleAddSubtask() {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    onAddSubtask(trimmed);
    setSubtaskInput("");
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

      <div className="relative z-10 w-full max-w-md rounded-lg bg-[#141414] border border-neutral-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
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

        <div>
          <label htmlFor="detail-recurrence" className="block text-xs text-neutral-500 mb-1">
            Recurrence
          </label>
          <select
            id="detail-recurrence"
            value={recurrencePreset}
            onChange={(e) => setRecurrencePreset(e.target.value as RecurrencePreset | "")}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {!isSubtask && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-neutral-500">Subtasks</span>
              {progress.total > 0 && (
                <span className="text-xs text-neutral-400">
                  {progress.done}/{progress.total} ({progress.percent}%)
                </span>
              )}
            </div>

            {progress.total > 0 && (
              <div className="w-full h-1 bg-neutral-800 rounded-full mb-3">
                <div
                  className="h-1 bg-amber-500 rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            )}

            <div className="space-y-1 mb-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(subtask.id)}
                    aria-label={`Mark "${subtask.title}" complete`}
                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 accent-amber-500 flex-shrink-0 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed ? "line-through text-neutral-500" : "text-neutral-300"
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(subtask.id)}
                    aria-label={`Remove subtask "${subtask.title}"`}
                    className="flex-shrink-0 text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                aria-label="New subtask"
                placeholder="Add a subtask..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask();
                  if (e.key === "Escape") setSubtaskInput("");
                }}
                className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
              />
              <button
                onClick={handleAddSubtask}
                className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

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
