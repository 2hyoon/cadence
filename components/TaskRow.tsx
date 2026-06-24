"use client";

import { dueStatus } from "../lib/views";
import type { SubtaskProgress } from "../lib/progress";
import type { Todo } from "../types/todo";

interface TaskRowProps {
  todo: Todo;
  today: string;
  subtaskProgress?: SubtaskProgress;
  isFocused?: boolean;
  rowRef?: (el: HTMLDivElement | null) => void;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-[#1c1c1c]",
  low: "bg-[rgba(28,28,28,0.3)]",
};

const BADGE_CLASS: Record<string, string> = {
  overdue: "text-red-500",
  today: "text-[#1c1c1c]",
  upcoming: "text-[#5f5f5d]",
};

export function TaskRow({ todo, today, subtaskProgress, isFocused, rowRef, onToggle, onSelect, onDelete }: TaskRowProps) {
  const status = dueStatus(todo.dueDate, today);

  return (
    <div
      ref={rowRef}
      className={[
        "rounded-lg bg-[#f7f4ed] border p-4 flex items-center gap-3",
        isFocused ? "border-[rgba(28,28,28,0.4)]" : "border-[#eceae4]",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        aria-label={`Mark "${todo.title}" complete`}
        className="w-4 h-4 rounded border-[#eceae4] bg-[#f7f4ed] accent-[#1c1c1c] flex-shrink-0 cursor-pointer"
      />

      <button
        onClick={onSelect}
        className={[
          "flex-1 text-left text-sm truncate",
          todo.completed ? "line-through text-[#5f5f5d]" : "text-[#1c1c1c] hover:text-[#1c1c1c]",
        ].join(" ")}
      >
        {todo.title}
      </button>

      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[todo.priority]}`} />

      {todo.recurrence && (
        <span className="text-xs text-[#5f5f5d] flex-shrink-0" title="Recurring">
          ↻
        </span>
      )}

      {subtaskProgress && subtaskProgress.total > 0 && (
        <span className="text-xs text-[#5f5f5d] flex-shrink-0" title="Subtask progress">
          {subtaskProgress.done}/{subtaskProgress.total}
        </span>
      )}

      {status !== "none" && (
        <span className={`text-xs flex-shrink-0 ${BADGE_CLASS[status]}`}>
          {todo.dueDate}
        </span>
      )}

      <button
        onClick={onDelete}
        aria-label={`Remove "${todo.title}"`}
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
  );
}
