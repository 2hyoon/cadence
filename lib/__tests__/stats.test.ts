import { describe, it, expect } from "vitest";
import { computeStats, recentCompletions } from "../stats";
import type { AppState, Todo, CompletionLogEntry } from "../../types/todo";

const TODAY = "2026-06-23";

function makeTodo(id: string, overrides: Partial<Todo> = {}): Todo {
  return {
    id,
    title: `Task ${id}`,
    priority: "medium",
    tags: [],
    completed: false,
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeLog(seriesId: string, date: string): CompletionLogEntry {
  return { seriesId, date };
}

const emptyState: AppState = { todos: [], completionLog: [] };

describe("computeStats — empty state", () => {
  it("returns 0% completion rate with no todos (no divide-by-zero)", () => {
    const stats = computeStats(emptyState, TODAY);
    expect(stats.completionRate).toBe(0);
    expect(stats.completedCount).toBe(0);
    expect(stats.totalCount).toBe(0);
    expect(Number.isNaN(stats.completionRate)).toBe(false);
  });

  it("returns zero recent total with empty completionLog", () => {
    const stats = computeStats(emptyState, TODAY);
    expect(stats.recentTotal).toBe(0);
    expect(stats.recentDays).toHaveLength(7);
    expect(stats.recentDays.every((d) => d.count === 0)).toBe(true);
  });
});

describe("computeStats — completion rate", () => {
  it("returns 0 when all todos are incomplete", () => {
    const state: AppState = {
      todos: [makeTodo("1"), makeTodo("2")],
      completionLog: [],
    };
    const stats = computeStats(state, TODAY);
    expect(stats.completionRate).toBe(0);
    expect(stats.completedCount).toBe(0);
    expect(stats.totalCount).toBe(2);
  });

  it("returns 1 when all todos are complete", () => {
    const state: AppState = {
      todos: [makeTodo("1", { completed: true }), makeTodo("2", { completed: true })],
      completionLog: [],
    };
    expect(computeStats(state, TODAY).completionRate).toBe(1);
  });

  it("returns partial rate for mix of done/undone", () => {
    const state: AppState = {
      todos: [
        makeTodo("1", { completed: true }),
        makeTodo("2"),
        makeTodo("3"),
        makeTodo("4", { completed: true }),
      ],
      completionLog: [],
    };
    const stats = computeStats(state, TODAY);
    expect(stats.completionRate).toBeCloseTo(0.5);
    expect(stats.completedCount).toBe(2);
    expect(stats.totalCount).toBe(4);
  });

  it("excludes subtasks from rate calculation", () => {
    const state: AppState = {
      todos: [
        makeTodo("parent", { completed: true }),
        makeTodo("sub1", { parentId: "parent", completed: false }),
        makeTodo("sub2", { parentId: "parent", completed: false }),
      ],
      completionLog: [],
    };
    const stats = computeStats(state, TODAY);
    expect(stats.totalCount).toBe(1);
    expect(stats.completedCount).toBe(1);
    expect(stats.completionRate).toBe(1);
  });
});

describe("computeStats — recent completions", () => {
  it("groups completions correctly by date within the window", () => {
    const state: AppState = {
      todos: [],
      completionLog: [
        makeLog("s1", TODAY),
        makeLog("s2", TODAY),
        makeLog("s3", "2026-06-22"),
      ],
    };
    const stats = computeStats(state, TODAY, 7);
    const todayEntry = stats.recentDays.find((d) => d.date === TODAY);
    const yesterdayEntry = stats.recentDays.find((d) => d.date === "2026-06-22");
    expect(todayEntry?.count).toBe(2);
    expect(yesterdayEntry?.count).toBe(1);
    expect(stats.recentTotal).toBe(3);
  });

  it("excludes completions before the window boundary", () => {
    const state: AppState = {
      todos: [],
      completionLog: [
        makeLog("s1", "2026-06-10"),
        makeLog("s2", TODAY),
      ],
    };
    const stats = computeStats(state, TODAY, 7);
    expect(stats.recentTotal).toBe(1);
  });

  it("excludes completions after today", () => {
    const state: AppState = {
      todos: [],
      completionLog: [makeLog("s1", "2026-06-30")],
    };
    expect(computeStats(state, TODAY).recentTotal).toBe(0);
  });

  it("produces recentDays array with length equal to windowDays", () => {
    const stats = computeStats(emptyState, TODAY, 14);
    expect(stats.recentDays).toHaveLength(14);
    expect(stats.windowDays).toBe(14);
  });

  it("window boundary is inclusive of windowStart", () => {
    // TODAY = 2026-06-23, windowDays=7 → windowStart = 2026-06-17
    const state: AppState = {
      todos: [],
      completionLog: [makeLog("s1", "2026-06-17")],
    };
    const stats = computeStats(state, TODAY, 7);
    expect(stats.recentTotal).toBe(1);
  });
});

describe("recentCompletions helper", () => {
  it("returns an array of length windowDays filled with zeros for empty log", () => {
    const days = recentCompletions([], TODAY);
    expect(days).toHaveLength(7);
    expect(days.every((d) => d.count === 0)).toBe(true);
  });

  it("groups multiple entries on the same day", () => {
    const log = [makeLog("a", TODAY), makeLog("b", TODAY), makeLog("c", TODAY)];
    const days = recentCompletions(log, TODAY);
    const todayEntry = days.find((d) => d.date === TODAY);
    expect(todayEntry?.count).toBe(3);
  });
});
