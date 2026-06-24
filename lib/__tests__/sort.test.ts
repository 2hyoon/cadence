import { describe, it, expect } from "vitest";
import { sortTodos } from "../sort";
import type { Todo } from "../../types/todo";

function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    title: "Test task",
    priority: "medium",
    tags: [],
    completed: false,
    createdAt: "2026-06-23T00:00:00.000Z",
    ...overrides,
  };
}

const A = makeTodo({ id: "a", dueDate: "2026-06-20", priority: "low",    createdAt: "2026-06-21T00:00:00.000Z" });
const B = makeTodo({ id: "b", dueDate: "2026-06-25", priority: "high",   createdAt: "2026-06-22T00:00:00.000Z" });
const C = makeTodo({ id: "c", dueDate: undefined,    priority: "medium",  createdAt: "2026-06-23T00:00:00.000Z" });

describe("sortTodos — dueDate", () => {
  it("sorts ascending: earliest first", () => {
    const result = sortTodos([B, A, C], "dueDate", "asc");
    expect(result.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts descending: latest first", () => {
    const result = sortTodos([A, B, C], "dueDate", "desc");
    expect(result.map((t) => t.id)).toEqual(["b", "a", "c"]);
  });

  it("undefined dueDate always sorts last (asc)", () => {
    const result = sortTodos([C, A, B], "dueDate", "asc");
    expect(result[result.length - 1].id).toBe("c");
  });

  it("undefined dueDate always sorts last (desc)", () => {
    const result = sortTodos([C, A, B], "dueDate", "desc");
    expect(result[result.length - 1].id).toBe("c");
  });
});

describe("sortTodos — priority", () => {
  it("sorts ascending: low → medium → high", () => {
    const result = sortTodos([B, C, A], "priority", "asc");
    expect(result.map((t) => t.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts descending: high → medium → low", () => {
    const result = sortTodos([A, C, B], "priority", "desc");
    expect(result.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });
});

describe("sortTodos — createdAt", () => {
  it("sorts ascending: oldest first", () => {
    const result = sortTodos([C, B, A], "createdAt", "asc");
    expect(result.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts descending: newest first", () => {
    const result = sortTodos([A, B, C], "createdAt", "desc");
    expect(result.map((t) => t.id)).toEqual(["c", "b", "a"]);
  });
});

describe("sortTodos — immutability", () => {
  it("does not mutate the input array", () => {
    const input = [B, A, C];
    const original = [...input];
    sortTodos(input, "dueDate", "asc");
    expect(input).toEqual(original);
  });
});
