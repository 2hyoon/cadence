import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskDetail } from "../TaskDetail";
import { TaskRow } from "../TaskRow";
import type { Todo } from "../../types/todo";

const baseTodo: Todo = {
  id: "parent",
  title: "Parent Task",
  priority: "medium",
  tags: [],
  completed: false,
  createdAt: "2026-06-23T00:00:00.000Z",
};

const noop = vi.fn();

function renderDetail(todo: Todo, subtasks: Todo[], overrides = {}) {
  return render(
    <TaskDetail
      todo={todo}
      subtasks={subtasks}
      onSave={noop}
      onClose={noop}
      onDelete={noop}
      onAddSubtask={noop}
      onToggleSubtask={noop}
      onDeleteSubtask={noop}
      {...overrides}
    />
  );
}

describe("TaskDetail — subtasks", () => {
  it("shows add-subtask input for a parent task", () => {
    renderDetail(baseTodo, []);
    expect(screen.getByPlaceholderText("Add a subtask...")).toBeInTheDocument();
  });

  it("does not show add-subtask input for a subtask (enforces one level)", () => {
    const child: Todo = { ...baseTodo, id: "child", parentId: "parent" };
    renderDetail(child, []);
    expect(screen.queryByPlaceholderText("Add a subtask...")).not.toBeInTheDocument();
  });

  it("calls onAddSubtask with trimmed title when Add is clicked", () => {
    const onAddSubtask = vi.fn();
    renderDetail(baseTodo, [], { onAddSubtask });
    fireEvent.change(screen.getByPlaceholderText("Add a subtask..."), {
      target: { value: "  Buy milk  " },
    });
    fireEvent.click(screen.getByText("Add"));
    expect(onAddSubtask).toHaveBeenCalledWith("Buy milk");
  });

  it("calls onAddSubtask when Enter is pressed in the subtask input", () => {
    const onAddSubtask = vi.fn();
    renderDetail(baseTodo, [], { onAddSubtask });
    const input = screen.getByPlaceholderText("Add a subtask...");
    fireEvent.change(input, { target: { value: "Walk the dog" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddSubtask).toHaveBeenCalledWith("Walk the dog");
  });

  it("clears the input after adding a subtask", () => {
    renderDetail(baseTodo, []);
    const input = screen.getByPlaceholderText("Add a subtask...");
    fireEvent.change(input, { target: { value: "Some task" } });
    fireEvent.click(screen.getByText("Add"));
    expect(input).toHaveValue("");
  });

  it("shows subtask titles in the list", () => {
    const sub1: Todo = { ...baseTodo, id: "s1", parentId: "parent", title: "First sub" };
    const sub2: Todo = { ...baseTodo, id: "s2", parentId: "parent", title: "Second sub" };
    renderDetail(baseTodo, [sub1, sub2]);
    expect(screen.getByText("First sub")).toBeInTheDocument();
    expect(screen.getByText("Second sub")).toBeInTheDocument();
  });

  it("shows progress when subtasks exist (updating parent progress)", () => {
    const sub1: Todo = { ...baseTodo, id: "s1", parentId: "parent", completed: true };
    const sub2: Todo = { ...baseTodo, id: "s2", parentId: "parent", completed: false };
    renderDetail(baseTodo, [sub1, sub2]);
    expect(screen.getByText("1/2 (50%)")).toBeInTheDocument();
  });

  it("calls onToggleSubtask when a subtask checkbox is clicked", () => {
    const onToggleSubtask = vi.fn();
    const sub: Todo = { ...baseTodo, id: "s1", parentId: "parent", title: "Sub one" };
    renderDetail(baseTodo, [sub], { onToggleSubtask });
    fireEvent.click(screen.getByLabelText('Mark "Sub one" complete'));
    expect(onToggleSubtask).toHaveBeenCalledWith("s1");
  });

  it("calls onDeleteSubtask when a subtask delete button is clicked", () => {
    const onDeleteSubtask = vi.fn();
    const sub: Todo = { ...baseTodo, id: "s1", parentId: "parent", title: "Sub one" };
    renderDetail(baseTodo, [sub], { onDeleteSubtask });
    fireEvent.click(screen.getByLabelText('Remove subtask "Sub one"'));
    expect(onDeleteSubtask).toHaveBeenCalledWith("s1");
  });
});

describe("TaskRow — subtask progress indicator", () => {
  it("shows done/total when subtaskProgress has items", () => {
    render(
      <TaskRow
        todo={baseTodo}
        today="2026-06-23"
        subtaskProgress={{ total: 3, done: 1, percent: 33 }}
        onToggle={noop}
        onSelect={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("does not show progress when total is 0", () => {
    render(
      <TaskRow
        todo={baseTodo}
        today="2026-06-23"
        subtaskProgress={{ total: 0, done: 0, percent: 0 }}
        onToggle={noop}
        onSelect={noop}
        onDelete={noop}
      />
    );
    expect(screen.queryByText("0/0")).not.toBeInTheDocument();
  });

  it("does not show progress when subtaskProgress is not provided", () => {
    render(
      <TaskRow
        todo={baseTodo}
        today="2026-06-23"
        onToggle={noop}
        onSelect={noop}
        onDelete={noop}
      />
    );
    expect(screen.queryByTitle("Subtask progress")).not.toBeInTheDocument();
  });
});
