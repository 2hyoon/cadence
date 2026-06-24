"use client";

import { TaskRow } from "./TaskRow";
import type { Todo } from "../types/todo";

interface TaskListProps {
  todos: Todo[];
  today: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ todos, today, onToggle, onSelect, onDelete }: TaskListProps) {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TaskRow
          key={todo.id}
          todo={todo}
          today={today}
          onToggle={() => onToggle(todo.id)}
          onSelect={() => onSelect(todo.id)}
          onDelete={() => onDelete(todo.id)}
        />
      ))}
    </div>
  );
}
