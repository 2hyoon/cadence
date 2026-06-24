import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadState, saveState, emptyState, STORAGE_KEY, STORAGE_VERSION } from "./storage";
import type { AppState } from "../types/todo";

const validState: AppState = {
  todos: [
    {
      id: "1",
      title: "Test",
      priority: "medium",
      tags: [],
      completed: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  completionLog: [],
};

function makeStore(initial: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe("storage", () => {
  describe("emptyState", () => {
    it("returns empty todos and completionLog", () => {
      expect(emptyState()).toEqual({ todos: [], completionLog: [] });
    });

    it("returns a fresh object each call", () => {
      const a = emptyState();
      const b = emptyState();
      expect(a).not.toBe(b);
    });
  });

  describe("loadState / saveState round-trip", () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, "localStorage", {
        value: makeStore(),
        writable: true,
        configurable: true,
      });
    });

    it("returns emptyState when nothing stored", () => {
      expect(loadState()).toEqual(emptyState());
    });

    it("round-trips a valid AppState", () => {
      saveState(validState);
      expect(loadState()).toEqual(validState);
    });
  });

  describe("loadState error handling", () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, "localStorage", {
        value: makeStore(),
        writable: true,
        configurable: true,
      });
    });

    it("returns emptyState for corrupt JSON", () => {
      Object.defineProperty(globalThis, "localStorage", {
        value: makeStore({ [STORAGE_KEY]: "not-json{{{" }),
        writable: true,
        configurable: true,
      });
      expect(loadState()).toEqual(emptyState());
    });

    it("returns emptyState when version mismatches", () => {
      const envelope = JSON.stringify({ version: STORAGE_VERSION + 1, state: validState });
      Object.defineProperty(globalThis, "localStorage", {
        value: makeStore({ [STORAGE_KEY]: envelope }),
        writable: true,
        configurable: true,
      });
      expect(loadState()).toEqual(emptyState());
    });

    it("returns emptyState when payload fails isAppState", () => {
      const envelope = JSON.stringify({ version: STORAGE_VERSION, state: { bad: true } });
      Object.defineProperty(globalThis, "localStorage", {
        value: makeStore({ [STORAGE_KEY]: envelope }),
        writable: true,
        configurable: true,
      });
      expect(loadState()).toEqual(emptyState());
    });
  });

  describe("saveState error handling", () => {
    it("swallows a quota-exceeded error without throwing", () => {
      const throwingStorage = makeStore();
      throwingStorage.setItem = () => { throw new DOMException("QuotaExceededError"); };
      Object.defineProperty(globalThis, "localStorage", {
        value: throwingStorage,
        writable: true,
        configurable: true,
      });
      expect(() => saveState(validState)).not.toThrow();
    });
  });

  describe("SSR path (no window)", () => {
    beforeEach(() => {
      vi.stubGlobal("window", undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("loadState returns emptyState on server", () => {
      expect(loadState()).toEqual(emptyState());
    });

    it("saveState is a no-op on server", () => {
      expect(() => saveState(validState)).not.toThrow();
    });
  });
});
