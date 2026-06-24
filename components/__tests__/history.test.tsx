import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../features/AppShell";
import { TodoProvider } from "../../store/TodoProvider";
import type { Todo } from "../../types/todo";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "task-1",
    title: "Target Task",
    priority: "medium",
    tags: [],
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setupStorage(todos: Todo[] = []) {
  const map: Record<string, string> = {};
  map["cadence_state"] = JSON.stringify({
    version: 1,
    state: { todos, completionLog: [] },
  });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map[k] ?? null,
    setItem: (k: string, v: string) => { map[k] = v; },
    removeItem: (k: string) => { delete map[k]; },
    clear: () => Object.keys(map).forEach((k) => delete map[k]),
  });
}

function renderApp() {
  return render(
    <TodoProvider>
      <AppShell />
    </TodoProvider>
  );
}

describe("Undo/redo — toast and keyboard", () => {
  beforeEach(() => setupStorage());

  it("shows undo toast after deleting a task", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: /remove/i }));

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/task deleted/i)).toBeInTheDocument();
  });

  it("undo via toast restores the deleted task", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: /remove/i }));
    expect(screen.queryByText("Target Task")).toBeNull();

    await user.click(await screen.findByRole("button", { name: /^undo$/i }));

    expect(await screen.findByText("Target Task")).toBeInTheDocument();
  });

  it("deleting a parent with subtasks then undo restores both", async () => {
    const parent = makeTodo({ id: "parent", title: "Parent Task" });
    const child = makeTodo({ id: "child", title: "Child Task", parentId: "parent" });
    setupStorage([parent, child]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: /remove/i }));
    await user.click(await screen.findByRole("button", { name: /^undo$/i }));

    expect(await screen.findByText("Parent Task")).toBeInTheDocument();

    // Open parent detail to verify subtask is also restored
    await user.click(await screen.findByRole("button", { name: "Parent Task" }));
    expect(await screen.findByText("Child Task")).toBeInTheDocument();
  });

  it("redo re-applies the delete after undo (⌘⇧Z)", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: /remove/i }));
    await user.click(await screen.findByRole("button", { name: /^undo$/i }));

    expect(await screen.findByText("Target Task")).toBeInTheDocument();

    await user.keyboard("{Meta>}{Shift>}Z{/Shift}{/Meta}");

    expect(screen.queryByText("Target Task")).toBeNull();
  });
});
