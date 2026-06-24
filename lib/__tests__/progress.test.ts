import { describe, it, expect } from "vitest";
import { subtaskProgress } from "../progress";
import type { Todo } from "../../types/todo";

const base: Todo = {
  id: "1",
  title: "Sub",
  priority: "medium",
  tags: [],
  completed: false,
  createdAt: "2026-06-23T00:00:00.000Z",
};

describe("subtaskProgress", () => {
  it("returns 0% when there are no subtasks (no divide-by-zero)", () => {
    expect(subtaskProgress("parent", [])).toEqual({ total: 0, done: 0, percent: 0 });
  });

  it("returns 0% when no subtasks are complete", () => {
    const sub = { ...base, id: "sub1", parentId: "parent" };
    expect(subtaskProgress("parent", [sub])).toEqual({ total: 1, done: 0, percent: 0 });
  });

  it("returns partial completion percent", () => {
    const sub1 = { ...base, id: "sub1", parentId: "parent", completed: true };
    const sub2 = { ...base, id: "sub2", parentId: "parent" };
    expect(subtaskProgress("parent", [sub1, sub2])).toEqual({ total: 2, done: 1, percent: 50 });
  });

  it("returns 100% when all subtasks are done", () => {
    const sub1 = { ...base, id: "sub1", parentId: "parent", completed: true };
    const sub2 = { ...base, id: "sub2", parentId: "parent", completed: true };
    expect(subtaskProgress("parent", [sub1, sub2])).toEqual({ total: 2, done: 2, percent: 100 });
  });

  it("ignores todos belonging to a different parent", () => {
    const sub = { ...base, id: "sub1", parentId: "other" };
    expect(subtaskProgress("parent", [sub])).toEqual({ total: 0, done: 0, percent: 0 });
  });
});
