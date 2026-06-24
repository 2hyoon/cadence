import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../features/AppShell";
import { TodoProvider } from "../../store/TodoProvider";
import { TaskRow } from "../TaskRow";
import type { Todo } from "../../types/todo";

const TODAY = "2026-01-15";
const PAST = "2026-01-10";
const FUTURE = "2026-01-20";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "test-id-1",
    title: "Sample task",
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

describe("Task CRUD", () => {
  beforeEach(() => setupStorage());

  it("add a task → appears in the All list", async () => {
    const user = userEvent.setup();
    renderApp();

    // Navigate to All view (Sidebar always renders)
    await user.click(screen.getAllByText("All")[0]);

    // Wait for TaskListContainer to hydrate
    const input = await screen.findByLabelText("New task");
    await user.type(input, "My new task");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("My new task")).toBeTruthy();
  });

  it("toggle → completed task moves to Completed view", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    // Navigate to All view and wait for the task
    await user.click(screen.getAllByText("All")[0]);
    const checkbox = await screen.findByRole("checkbox", { name: /sample task/i });
    await user.click(checkbox);

    // Navigate to Completed view
    await user.click(screen.getAllByText("Completed")[0]);
    expect(await screen.findByText("Sample task")).toBeTruthy();
  });

  it("edit title persists via store", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    // Navigate to All view and click the task to open detail
    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: "Sample task" }));

    // Edit title in the detail panel
    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated task");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Updated task")).toBeTruthy();
  });

  it("delete removes task from list", async () => {
    setupStorage([makeTodo()]);
    const user = userEvent.setup();
    renderApp();

    // Navigate to All view and open the task detail
    await user.click(screen.getAllByText("All")[0]);
    await user.click(await screen.findByRole("button", { name: "Sample task" }));

    // Delete from detail panel
    await user.click(screen.getByRole("button", { name: "Delete task" }));

    expect(screen.queryByText("Sample task")).toBeNull();
  });
});

describe("TaskRow due-date badge", () => {
  it("overdue date → red class", () => {
    render(
      <TaskRow
        todo={makeTodo({ dueDate: PAST })}
        today={TODAY}
        onToggle={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
      />
    );
    const badge = screen.getByText(PAST);
    expect(badge.className).toMatch(/red/);
  });

  it("today date → amber class", () => {
    render(
      <TaskRow
        todo={makeTodo({ dueDate: TODAY })}
        today={TODAY}
        onToggle={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
      />
    );
    const badge = screen.getByText(TODAY);
    expect(badge.className).toMatch(/amber/);
  });

  it("upcoming date → neutral class", () => {
    render(
      <TaskRow
        todo={makeTodo({ dueDate: FUTURE })}
        today={TODAY}
        onToggle={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
      />
    );
    const badge = screen.getByText(FUTURE);
    expect(badge.className).toMatch(/neutral/);
  });
});
