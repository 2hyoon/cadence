import { describe, it, expect } from "vitest";
import { record, undo, redo, type History } from "../history";

function h<T>(past: T[], present: T, future: T[]): History<T> {
  return { past, present, future };
}

describe("record", () => {
  it("pushes present to past and sets next as present", () => {
    expect(record(h([1], 2, [3]), 4)).toEqual(h([1, 2], 4, []));
  });

  it("clears future", () => {
    expect(record(h([], 1, [2, 3]), 4).future).toEqual([]);
  });
});

describe("undo", () => {
  it("moves present to future head and pops past", () => {
    expect(undo(h([1, 2], 3, []))).toEqual(h([1], 2, [3]));
  });

  it("is a no-op on empty past (returns same reference)", () => {
    const orig = h([], 1, [2]);
    expect(undo(orig)).toBe(orig);
  });
});

describe("redo", () => {
  it("moves present to past tail and pops future", () => {
    expect(redo(h([1], 2, [3, 4]))).toEqual(h([1, 2], 3, [4]));
  });

  it("is a no-op on empty future (returns same reference)", () => {
    const orig = h([1], 2, []);
    expect(redo(orig)).toBe(orig);
  });
});

describe("round-trip and branching", () => {
  it("undo then redo restores present and clears future", () => {
    const s1 = record(h([], "a", []), "b");
    const s2 = record(s1, "c");
    expect(redo(undo(s2))).toEqual(h(["a", "b"], "c", []));
  });

  it("new record after undo discards old future", () => {
    const s1 = record(h([], "a", []), "b"); // past=['a'], present='b', future=[]
    const undone = undo(s1);               // past=[], present='a', future=['b']
    const branched = record(undone, "c");  // past=['a'], present='c', future=[]
    expect(branched).toEqual(h(["a"], "c", []));
  });
});
