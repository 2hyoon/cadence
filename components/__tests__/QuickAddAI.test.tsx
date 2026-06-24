import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../features/AppShell";
import { TodoProvider } from "../../store/TodoProvider";

beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderShell() {
  return render(
    <TodoProvider>
      <AppShell />
    </TodoProvider>
  );
}

describe("QuickAdd AI — natural-language parse", () => {
  it("successful parse pre-fills manual fields and confirming adds the task", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          title: "Team meeting",
          dueDate: "2026-06-25",
          priority: "high",
          tags: ["work"],
        }),
      })
    );

    renderShell();
    await user.keyboard("{Meta>}k{/Meta}");

    const nlInput = screen.getByLabelText("Describe task naturally");
    await user.type(nlInput, "team meeting tomorrow urgent");
    await user.click(screen.getByRole("button", { name: "Parse" }));

    // Title field pre-filled
    await waitFor(() => {
      expect(screen.getByLabelText("Task title")).toHaveValue("Team meeting");
    });

    // Confirm by clicking Add task
    await user.click(screen.getByRole("button", { name: /add task/i }));

    // Modal closed
    expect(screen.queryByRole("dialog", { name: "Quick add task" })).toBeNull();

    // Task appears in All view
    await user.click(screen.getAllByText("All")[0]);
    expect(await screen.findByText("Team meeting")).toBeTruthy();
  });

  it("error response falls back to manual entry and user can still add a task", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "AI unavailable" }),
      })
    );

    renderShell();
    await user.keyboard("{Meta>}k{/Meta}");

    const nlInput = screen.getByLabelText("Describe task naturally");
    await user.type(nlInput, "something");
    await user.click(screen.getByRole("button", { name: "Parse" }));

    // Fallback notice shown
    await waitFor(() => {
      expect(screen.getByText(/AI parsing unavailable/i)).toBeTruthy();
    });

    // Manual fields still usable
    const titleInput = screen.getByLabelText("Task title");
    await user.type(titleInput, "Manual task");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    // Task added
    await user.click(screen.getAllByText("All")[0]);
    expect(await screen.findByText("Manual task")).toBeTruthy();
  });

  it("loading state renders during in-flight request", async () => {
    const user = userEvent.setup();
    let resolveFetch!: (v: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((r) => {
          resolveFetch = r;
        })
      )
    );

    renderShell();
    await user.keyboard("{Meta>}k{/Meta}");

    const nlInput = screen.getByLabelText("Describe task naturally");
    await user.type(nlInput, "something");
    await user.click(screen.getByRole("button", { name: "Parse" }));

    // Loading indicator visible
    expect(screen.getByText("Parsing...")).toBeTruthy();

    // Resolve the fetch
    resolveFetch({
      ok: true,
      json: async () => ({ title: "Done", priority: "medium", tags: [] }),
    });

    await waitFor(() => {
      expect(screen.queryByText("Parsing...")).toBeNull();
    });
  });
});
