"use client";

import { useEffect, useRef } from "react";
import { TaskRow } from "./TaskRow";
import type { SubtaskProgress } from "../lib/progress";
import type { Todo } from "../types/todo";

interface TaskListProps {
  todos: Todo[];
  today: string;
  subtaskProgressMap?: Record<string, SubtaskProgress>;
  focusedIndex?: number;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ todos, today, subtaskProgressMap, focusedIndex = -1, onToggle, onSelect, onDelete }: TaskListProps) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = focusedIndex >= 0 ? rowRefs.current[focusedIndex] : null;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  return (
    <div className="space-y-2">
      {todos.map((todo, i) => (
        <TaskRow
          key={todo.id}
          todo={todo}
          today={today}
          subtaskProgress={subtaskProgressMap?.[todo.id]}
          isFocused={focusedIndex === i}
          rowRef={(el) => { rowRefs.current[i] = el; }}
          onToggle={() => onToggle(todo.id)}
          onSelect={() => onSelect(todo.id)}
          onDelete={() => onDelete(todo.id)}
        />
      ))}
    </div>
  );
}
