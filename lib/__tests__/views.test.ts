import { describe, it, expect } from "vitest";
import { classify, dueStatus } from "../views";
import type { Todo } from "../../types/todo";

const TODAY = "2026-06-23";
const YESTERDAY = "2026-06-22";
const TOMORROW = "2026-06-24";

function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    title: "Test",
    priority: "medium",
    tags: [],
    completed: false,
    createdAt: "2026-06-23T00:00:00.000Z",
    ...overrides,
  };
}

describe("dueStatus", () => {
  it("returns none when dueDate is undefined", () => {
    expect(dueStatus(undefined, TODAY)).toBe("none");
  });

  it("returns today when dueDate equals today", () => {
    expect(dueStatus(TODAY, TODAY)).toBe("today");
  });

  it("returns overdue when dueDate is before today", () => {
    expect(dueStatus(YESTERDAY, TODAY)).toBe("overdue");
  });

  it("returns upcoming when dueDate is after today", () => {
    expect(dueStatus(TOMORROW, TODAY)).toBe("upcoming");
  });
});

describe("classify", () => {
  it("places a todo with dueDate === today in the today view", () => {
    const todo = makeTodo({ id: "1", dueDate: TODAY });
    const views = classify([todo], TODAY);
    expect(views.today).toHaveLength(1);
    expect(views.today[0].id).toBe("1");
  });

  it("places an overdue todo (dueDate < today) in the today view", () => {
    const todo = makeTodo({ id: "1", dueDate: YESTERDAY });
    const views = classify([todo], TODAY);
    expect(views.today).toHaveLength(1);
  });

  it("places a future todo (dueDate > today) in the upcoming view", () => {
    const todo = makeTodo({ id: "1", dueDate: TOMORROW });
    const views = classify([todo], TODAY);
    expect(views.upcoming).toHaveLength(1);
    expect(views.today).toHaveLength(0);
  });

  it("places a todo without a dueDate only in the all view", () => {
    const todo = makeTodo({ id: "1" });
    const views = classify([todo], TODAY);
    expect(views.today).toHaveLength(0);
    expect(views.upcoming).toHaveLength(0);
    expect(views.all).toHaveLength(1);
  });

  it("places a completed todo only in the completed view", () => {
    const todo = makeTodo({ id: "1", completed: true, dueDate: TODAY });
    const views = classify([todo], TODAY);
    expect(views.completed).toHaveLength(1);
    expect(views.today).toHaveLength(0);
    expect(views.all).toHaveLength(0);
  });

  it("excludes subtasks (parentId set) from all views", () => {
    const parent = makeTodo({ id: "parent" });
    const child = makeTodo({ id: "child", parentId: "parent", dueDate: TODAY });
    const views = classify([parent, child], TODAY);
    expect(views.all).toHaveLength(1);
    expect(views.all[0].id).toBe("parent");
    expect(views.today).toHaveLength(0);
  });

  it("all view includes incomplete todos regardless of dueDate", () => {
    const withDue = makeTodo({ id: "1", dueDate: TOMORROW });
    const withoutDue = makeTodo({ id: "2" });
    const views = classify([withDue, withoutDue], TODAY);
    expect(views.all).toHaveLength(2);
  });

  it("does not include completed todos in today/upcoming/all views", () => {
    const todo = makeTodo({ id: "1", completed: true });
    const views = classify([todo], TODAY);
    expect(views.today).toHaveLength(0);
    expect(views.upcoming).toHaveLength(0);
    expect(views.all).toHaveLength(0);
    expect(views.completed).toHaveLength(1);
  });
});
