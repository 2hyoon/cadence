import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../features/AppShell";
import { TodoProvider } from "../../store/TodoProvider";

beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  });
});

function renderShell() {
  return render(
    <TodoProvider>
      <AppShell />
    </TodoProvider>
  );
}

describe("QuickAdd — global shortcut", () => {
  it("⌘K opens the Quick Add modal", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.keyboard("{Meta>}k{/Meta}");

    expect(screen.getByRole("dialog", { name: "Quick add task" })).toBeTruthy();
  });

  it("Ctrl+K opens the Quick Add modal", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("dialog", { name: "Quick add task" })).toBeTruthy();
  });

  it("Esc closes the modal without adding a task", async () => {
    const user = userEvent.setup();
    renderShell();

    // Open via ⌘K
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog", { name: "Quick add task" })).toBeTruthy();

    // Close via Esc
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Quick add task" })).toBeNull();
  });
});

describe("QuickAdd — submit", () => {
  it("submitting with a title adds the task and closes the modal", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.keyboard("{Meta>}k{/Meta}");

    const titleInput = screen.getByLabelText("Task title");
    await user.type(titleInput, "Buy groceries");
    await user.keyboard("{Enter}");

    // Modal is closed
    expect(screen.queryByRole("dialog", { name: "Quick add task" })).toBeNull();

    // Task appears in the All view
    await user.click(screen.getAllByText("All")[0]);
    expect(await screen.findByText("Buy groceries")).toBeTruthy();
  });

  it("submitting with an empty title shows an error and keeps the modal open", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.keyboard("{Meta>}k{/Meta}");

    // Don't type anything, just press Enter
    await user.keyboard("{Enter}");

    // Modal stays open
    expect(screen.getByRole("dialog", { name: "Quick add task" })).toBeTruthy();
    expect(screen.getByText("Title is required.")).toBeTruthy();
  });
});
