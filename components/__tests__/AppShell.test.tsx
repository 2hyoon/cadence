import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../features/AppShell";
import { TodoProvider } from "../../store/TodoProvider";

// Stub localStorage so the provider's hydration doesn't throw
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

describe("AppShell", () => {
  it("renders all five primary navigation items", () => {
    renderShell();
    // Each label appears in both desktop sidebar and mobile tab bar
    expect(screen.getAllByText("Today").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Upcoming").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("All").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Stats").length).toBeGreaterThanOrEqual(1);
  });

  it("defaults to the Today heading", () => {
    renderShell();
    expect(screen.getByRole("heading", { name: "Today" })).toBeTruthy();
  });

  it("switches the heading when a nav item is clicked", async () => {
    const user = userEvent.setup();
    renderShell();

    // Click the first "Upcoming" button (desktop sidebar)
    const upcomingButtons = screen.getAllByText("Upcoming");
    await user.click(upcomingButtons[0]);

    expect(screen.getByRole("heading", { name: "Upcoming" })).toBeTruthy();
  });
});
