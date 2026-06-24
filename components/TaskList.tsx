"use client";

import { TaskRow } from "./TaskRow";
import type { SubtaskProgress } from "../lib/progress";
import type { Todo } from "../types/todo";

interface TaskListProps {
  todos: Todo[];
  today: string;
  subtaskProgressMap?: Record<string, SubtaskProgress>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ todos, today, subtaskProgressMap, onToggle, onSelect, onDelete }: TaskListProps) {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TaskRow
          key={todo.id}
          todo={todo}
          today={today}
          subtaskProgress={subtaskProgressMap?.[todo.id]}
          onToggle={() => onToggle(todo.id)}
          onSelect={() => onSelect(todo.id)}
          onDelete={() => onDelete(todo.id)}
        />
      ))}
    </div>
  );
}
