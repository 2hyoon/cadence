import { describe, it, expect } from "vitest";
import { isTodo, isAppState } from "./todo";

const validTodo = {
  id: "abc",
  title: "Test task",
  priority: "medium",
  tags: [],
  completed: false,
  createdAt: "2026-06-23T00:00:00.000Z",
};

describe("isTodo", () => {
  it("accepts a minimal valid todo", () => {
    expect(isTodo(validTodo)).toBe(true);
  });

  it("accepts a fully-populated todo", () => {
    expect(
      isTodo({
        ...validTodo,
        notes: "some notes",
        dueDate: "2026-06-30",
        tags: ["work"],
        parentId: "parent-1",
        seriesId: "series-1",
        recurrence: { preset: "weekly" },
      })
    ).toBe(true);
  });

  it("rejects null", () => expect(isTodo(null)).toBe(false));
  it("rejects a primitive", () => expect(isTodo("string")).toBe(false));
  it("rejects missing id", () => expect(isTodo({ ...validTodo, id: undefined })).toBe(false));
  it("rejects missing title", () => expect(isTodo({ ...validTodo, title: undefined })).toBe(false));
  it("rejects invalid priority", () => expect(isTodo({ ...validTodo, priority: "critical" })).toBe(false));
  it("rejects non-array tags", () => expect(isTodo({ ...validTodo, tags: "work" })).toBe(false));
  it("rejects tags with non-string element", () => expect(isTodo({ ...validTodo, tags: [1] })).toBe(false));
  it("rejects non-boolean completed", () => expect(isTodo({ ...validTodo, completed: 0 })).toBe(false));
  it("rejects missing createdAt", () => expect(isTodo({ ...validTodo, createdAt: undefined })).toBe(false));
  it("rejects invalid recurrence preset", () =>
    expect(isTodo({ ...validTodo, recurrence: { preset: "hourly" } })).toBe(false));
  it("rejects numeric notes", () => expect(isTodo({ ...validTodo, notes: 42 })).toBe(false));
  it("rejects numeric parentId", () => expect(isTodo({ ...validTodo, parentId: 99 })).toBe(false));
});

describe("isAppState", () => {
  const validState = { todos: [validTodo], completionLog: [] };

  it("accepts a valid AppState", () => expect(isAppState(validState)).toBe(true));
  it("accepts empty todos and log", () => expect(isAppState({ todos: [], completionLog: [] })).toBe(true));
  it("accepts a completionLog with entries", () =>
    expect(
      isAppState({
        todos: [],
        completionLog: [{ seriesId: "s1", date: "2026-06-01" }],
      })
    ).toBe(true));

  it("rejects null", () => expect(isAppState(null)).toBe(false));
  it("rejects missing todos", () => expect(isAppState({ completionLog: [] })).toBe(false));
  it("rejects missing completionLog", () => expect(isAppState({ todos: [] })).toBe(false));
  it("rejects todos with invalid entry", () =>
    expect(isAppState({ todos: [{ id: "x" }], completionLog: [] })).toBe(false));
  it("rejects completionLog with missing date", () =>
    expect(isAppState({ todos: [], completionLog: [{ seriesId: "s1" }] })).toBe(false));
  it("rejects completionLog with missing seriesId", () =>
    expect(isAppState({ todos: [], completionLog: [{ date: "2026-06-01" }] })).toBe(false));
});
