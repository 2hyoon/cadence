# Step 5: todo-crud-ui

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `types/todo.ts` (step 1), `store/` (step 3), `lib/views.ts` (step 4)
- The shell components created in step 4.

## Task

Build the task list and detail UI with full CRUD, wired to the store.

1. `components/` — presentational pieces (props in, callbacks out):
   - `TaskRow` — title, completion checkbox/toggle, priority indicator, tags, and a **due-date badge** colored by `dueStatus` from `lib/views.ts` (overdue = red, today = amber, upcoming = neutral; none = hidden).
   - `TaskList` — renders the rows for the active view.
   - `TaskDetail` — view/edit a single task: title, notes, due date (`YYYY-MM-DD` input), priority, tags. (Subtask UI and recurrence editing arrive in phase 1 — leave clean seams but don't build them now.)
   - An "add task" affordance within a view (a full Quick-Add modal comes in step 6; here a simple inline add is enough).
2. `features/` — containers that connect the components to `useTodos()` and the step 3 action creators (add / edit / toggle / delete). Deleting a parent must remove its subtasks (reducer already cascades — just call delete).
3. Wire the active-view list from step 4 to render real `TaskRow`s.

Keyboard niceties where natural (Enter to save, Esc to cancel in detail/edit), consistent with the keyboard-first principle.

Tests (React Testing Library): add a task → appears in the list; toggle → moves to/from Completed view; edit title persists via store; delete removes it; due-date badge shows the correct status class for overdue/today/upcoming.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: components are presentational; containers in `features/` own the store wiring; badge colors and styles follow UI_GUIDE; date input is `YYYY-MM-DD`.
3. Update step 5 in `phases/0-mvp/index.json` (completed + summary: component names, container locations, how the badge maps `dueStatus` to color).

## Prohibitions

- Don't put store/dispatch logic inside presentational `components/`. Reason: ARCHITECTURE separation (containers live in `features/`).
- Don't build subtask or recurrence UI here. Reason: those are phase 1 steps; keep scope to one layer.
- Don't introduce a date library. Reason: ADR — date-only strings, no deps.
- Don't break existing tests.
