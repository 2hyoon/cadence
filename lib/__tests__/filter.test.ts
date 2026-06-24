import { describe, it, expect } from "vitest";
import { filterTodos } from "../filter";
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

const TODOS: Todo[] = [
  makeTodo({ id: "1", title: "Buy groceries", tags: ["errands"], priority: "low" }),
  makeTodo({ id: "2", title: "Write report", notes: "quarterly review", tags: ["work"], priority: "high" }),
  makeTodo({ id: "3", title: "Call doctor", tags: ["health", "errands"], priority: "medium" }),
];

describe("filterTodos", () => {
  it("returns all todos when criteria is empty", () => {
    expect(filterTodos(TODOS, {})).toHaveLength(3);
  });

  it("filters by title query (case-insensitive)", () => {
    const result = filterTodos(TODOS, { query: "GROCERIES" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by notes query", () => {
    const result = filterTodos(TODOS, { query: "quarterly" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by tag query (substring match)", () => {
    const result = filterTodos(TODOS, { query: "work" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty when query matches nothing", () => {
    expect(filterTodos(TODOS, { query: "zzz" })).toHaveLength(0);
  });

  it("filters by priority", () => {
    const result = filterTodos(TODOS, { priority: "high" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns all when priority filter matches all (not in sample but passthrough for low)", () => {
    const result = filterTodos(TODOS, { priority: "low" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by tag (exact tag value)", () => {
    const result = filterTodos(TODOS, { tag: "errands" });
    expect(result).toHaveLength(2);
    const ids = result.map((t) => t.id);
    expect(ids).toContain("1");
    expect(ids).toContain("3");
  });

  it("combines query and priority criteria (AND logic)", () => {
    const result = filterTodos(TODOS, { query: "report", priority: "high" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("combines query and tag criteria (AND logic)", () => {
    const result = filterTodos(TODOS, { query: "call", tag: "health" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("does not mutate the input array", () => {
    const original = [...TODOS];
    filterTodos(TODOS, { query: "buy" });
    expect(TODOS).toEqual(original);
  });

  it("trims whitespace from query", () => {
    const result = filterTodos(TODOS, { query: "  write  " });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
