# Step 2: history

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `/docs/ADR.md` (ADR-007 snapshot undo/redo)
- `store/` (reducer + provider), `types/todo.ts`

## Task

Implement undo/redo via snapshot history.

1. `lib/history.ts` — **pure** snapshot stack helpers, generic over the snapshot type:
   - A `History<T>` shape `{ past: T[]; present: T; future: T[] }`.
   - `record(history, next)` — push current present to `past`, set `present = next`, **clear `future`** (a new action invalidates redo).
   - `undo(history)` / `redo(history)` — move between `past`/`present`/`future`; no-ops when the respective stack is empty.
   - Optionally cap `past` length (document the cap if you add one).
2. Store integration: wrap `AppState` transitions so user actions (add/edit/toggle/delete/subtask/recurrence-complete) are recorded; `hydrate`/persistence load is **not** an undoable action. Persistence should save the `present` state (keep the storage shape unchanged — persist `AppState`, not the whole history).
3. Keyboard: `⌘Z` undo, `⌘⇧Z` (and/or `Ctrl+Y`) redo, wired globally.
4. UX: when a task is deleted or completed, show an **Undo toast** (slide-up per UI_GUIDE) that triggers undo.

Tests (unit, pure): record clears future; undo then redo round-trips; undo on empty `past` is a no-op; a new `record` after undo discards the old future. Component test: deleting a task (incl. one with subtasks) then undo restores it; redo re-applies; the toast appears.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: `lib/history.ts` is pure; hydration is not undoable; persisted shape is still `AppState`.
3. Update step 2 in `phases/1-advanced/index.json` (completed + summary: `History<T>` API, which actions are recorded, persisted shape note).

## Prohibitions

- Don't make `hydrate`/load an undoable step. Reason: undoing into a pre-load empty state is wrong.
- Don't persist the entire history to storage. Reason: storage shape is `AppState` (ADR-006); persist `present` only.
- Don't keep `future` after a new action. Reason: standard redo invalidation (ADR-007).
- Don't break existing tests.
