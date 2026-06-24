export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

// Past is capped to prevent unbounded memory growth from long sessions.
const MAX_PAST = 100;

export function record<T>(history: History<T>, next: T): History<T> {
  const newPast = [...history.past, history.present];
  return {
    past: newPast.length > MAX_PAST ? newPast.slice(newPast.length - MAX_PAST) : newPast,
    present: next,
    future: [],
  };
}

export function undo<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history;
  const past = history.past.slice(0, -1);
  const present = history.past[history.past.length - 1];
  return {
    past,
    present,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history;
  const [present, ...future] = history.future;
  return {
    past: [...history.past, history.present],
    present,
    future,
  };
}
