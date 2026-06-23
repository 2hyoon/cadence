import { describe, it, expect } from "vitest";
import { reducer } from "../reducer";
import type { AppState, Todo } from "../../types/todo";

function emptyState(): AppState {
  return { todos: [], completionLog: [] };
}

const baseTodo: Todo = {
  id: "1",
  title: "Test todo",
  priority: "medium",
  tags: [],
  completed: false,
  createdAt: "2026-06-23T00:00:00.000Z",
};

describe("reducer", () => {
  describe("add", () => {
    it("appends a todo to empty state", () => {
      const next = reducer(emptyState(), { type: "add", payload: baseTodo });
      expect(next.todos).toHaveLength(1);
      expect(next.todos[0]).toEqual(baseTodo);
    });

    it("does not mutate original state", () => {
      const state = emptyState();
      reducer(state, { type: "add", payload: baseTodo });
      expect(state.todos).toHaveLength(0);
    });
  });

  describe("edit", () => {
    it("updates fields on the matching todo", () => {
      const state = { ...emptyState(), todos: [baseTodo] };
      const next = reducer(state, {
        type: "edit",
        payload: { id: "1", title: "Updated" },
      });
      expect(next.todos[0].title).toBe("Updated");
      expect(next.todos[0].completed).toBe(false);
    });

    it("ignores edits for unknown ids", () => {
      const state = { ...emptyState(), todos: [baseTodo] };
      const next = reducer(state, {
        type: "edit",
        payload: { id: "999", title: "Updated" },
      });
      expect(next.todos[0]).toEqual(baseTodo);
    });
  });

  describe("toggle", () => {
    it("toggles completed from false to true", () => {
      const state = { ...emptyState(), todos: [baseTodo] };
      const next = reducer(state, { type: "toggle", payload: { id: "1" } });
      expect(next.todos[0].completed).toBe(true);
    });

    it("toggles completed from true to false", () => {
      const todo = { ...baseTodo, completed: true };
      const state = { ...emptyState(), todos: [todo] };
      const next = reducer(state, { type: "toggle", payload: { id: "1" } });
      expect(next.todos[0].completed).toBe(false);
    });

    it("only toggles the targeted todo", () => {
      const todo2 = { ...baseTodo, id: "2" };
      const state = { ...emptyState(), todos: [baseTodo, todo2] };
      const next = reducer(state, { type: "toggle", payload: { id: "1" } });
      expect(next.todos[0].completed).toBe(true);
      expect(next.todos[1].completed).toBe(false);
    });
  });

  describe("delete", () => {
    it("removes the targeted todo", () => {
      const state = { ...emptyState(), todos: [baseTodo] };
      const next = reducer(state, { type: "delete", payload: { id: "1" } });
      expect(next.todos).toHaveLength(0);
    });

    it("cascades to subtasks (children with matching parentId)", () => {
      const parent: Todo = { ...baseTodo, id: "parent" };
      const child: Todo = { ...baseTodo, id: "child", parentId: "parent" };
      const state = { ...emptyState(), todos: [parent, child] };
      const next = reducer(state, { type: "delete", payload: { id: "parent" } });
      expect(next.todos).toHaveLength(0);
    });

    it("does not remove sibling todos", () => {
      const todo2: Todo = { ...baseTodo, id: "2" };
      const state = { ...emptyState(), todos: [baseTodo, todo2] };
      const next = reducer(state, { type: "delete", payload: { id: "1" } });
      expect(next.todos).toHaveLength(1);
      expect(next.todos[0].id).toBe("2");
    });

    it("does not remove grandchildren (only direct children)", () => {
      const parent: Todo = { ...baseTodo, id: "parent" };
      const child: Todo = { ...baseTodo, id: "child", parentId: "parent" };
      const other: Todo = { ...baseTodo, id: "other" };
      const state = { ...emptyState(), todos: [parent, child, other] };
      const next = reducer(state, { type: "delete", payload: { id: "child" } });
      expect(next.todos).toHaveLength(2);
    });
  });

  describe("hydrate", () => {
    it("replaces entire state with the payload", () => {
      const newState: AppState = {
        todos: [baseTodo],
        completionLog: [{ seriesId: "s1", date: "2026-06-23" }],
      };
      const next = reducer(emptyState(), { type: "hydrate", payload: newState });
      expect(next).toEqual(newState);
    });

    it("can replace non-empty state with empty state", () => {
      const state = { ...emptyState(), todos: [baseTodo] };
      const next = reducer(state, { type: "hydrate", payload: emptyState() });
      expect(next.todos).toHaveLength(0);
    });
  });
});
