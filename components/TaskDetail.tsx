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

const inputClass =
  "w-full rounded-md bg-[#f7f4ed] border border-[#eceae4] px-4 py-3 text-sm text-[#1c1c1c] placeholder-[#5f5f5d] input-ring";

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
        className="absolute inset-0 bg-[#1c1c1c]/20"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#f7f4ed] border border-[#eceae4] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <label htmlFor="detail-title" className="block text-xs text-[#5f5f5d] mb-1">
            Title
          </label>
          <input
            id="detail-title"
            ref={titleRef}
            aria-label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="detail-notes" className="block text-xs text-[#5f5f5d] mb-1">
            Notes
          </label>
          <textarea
            id="detail-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="detail-due" className="block text-xs text-[#5f5f5d] mb-1">
              Due date
            </label>
            <input
              id="detail-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex-1">
            <label htmlFor="detail-priority" className="block text-xs text-[#5f5f5d] mb-1">
              Priority
            </label>
            <select
              id="detail-priority"
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
          <label htmlFor="detail-recurrence" className="block text-xs text-[#5f5f5d] mb-1">
            Recurrence
          </label>
          <select
            id="detail-recurrence"
            value={recurrencePreset}
            onChange={(e) => setRecurrencePreset(e.target.value as RecurrencePreset | "")}
            className={inputClass}
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
              <span className="text-xs text-[#5f5f5d]">Subtasks</span>
              {progress.total > 0 && (
                <span className="text-xs text-[#5f5f5d]">
                  {progress.done}/{progress.total} ({progress.percent}%)
                </span>
              )}
            </div>

            {progress.total > 0 && (
              <div className="w-full h-1 bg-[rgba(28,28,28,0.08)] rounded-full mb-3">
                <div
                  className="h-1 bg-[#1c1c1c] rounded-full transition-all"
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
                    className="w-4 h-4 rounded border-[#eceae4] bg-[#f7f4ed] accent-[#1c1c1c] flex-shrink-0 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed ? "line-through text-[#5f5f5d]" : "text-[#1c1c1c]"
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(subtask.id)}
                    aria-label={`Remove subtask "${subtask.title}"`}
                    className="flex-shrink-0 text-[rgba(28,28,28,0.3)] hover:text-red-500 transition-colors"
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
                className="flex-1 rounded-md bg-[#f7f4ed] border border-[#eceae4] px-3 py-2 text-sm text-[#1c1c1c] placeholder-[#5f5f5d] input-ring"
              />
              <button
                onClick={handleAddSubtask}
                className="rounded-md border border-[rgba(28,28,28,0.4)] px-3 py-2 text-sm text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="rounded-md bg-[#1c1c1c] text-[#fcfbf8] text-sm font-medium px-4 py-2 btn-inset transition-opacity"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-[rgba(28,28,28,0.4)] text-[#1c1c1c] text-sm px-4 py-2 hover:bg-[rgba(28,28,28,0.04)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="ml-auto rounded-md text-[#5f5f5d] text-sm px-4 py-2 hover:text-red-500 transition-colors"
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
