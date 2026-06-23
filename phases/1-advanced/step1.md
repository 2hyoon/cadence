# Step 1: subtasks

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `/docs/ADR.md` (ADR-005 flat subtasks via `parentId`, one level deep)
- `types/todo.ts`, `store/` (reducer + action creators), step 5 `TaskDetail`/`TaskRow`

## Task

Implement one-level subtasks with a progress indicator.

1. Store/actions: an action creator to add a subtask (creates a `Todo` with `parentId` set to the parent's id). Editing/toggling/deleting reuse the existing actions. Parent deletion already cascades to children (phase 0 step 3) — verify it still holds.
2. `lib/progress.ts` — **pure** aggregation:
   - `subtaskProgress(parentId: string, todos: Todo[]): { total: number; done: number; percent: number }`.
   - `percent` is `0` when `total === 0` (guard the divide-by-zero). Round to an integer.
3. UI: in `TaskDetail`, list a parent's subtasks, allow add/toggle/delete of subtasks, and show a progress `%` (and/or a bar). On `TaskRow`, show a compact progress indicator when a task has subtasks. Enforce one level: a subtask cannot itself have subtasks (don't render the add-subtask affordance on a subtask).

Tests (unit, pure for progress): 0 subtasks → 0% (no divide-by-zero); partial completion percent; all done → 100%. Component test: adding a subtask updates the parent progress; deleting the parent removes its subtasks.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: subtasks are flat (`parentId`), one level only; `lib/progress.ts` is pure with a zero guard; cascade delete intact.
3. Update step 1 in `phases/1-advanced/index.json` (completed + summary: `subtaskProgress` signature, add-subtask action, where progress renders).

## Prohibitions

- Don't allow nesting beyond one level. Reason: ADR-005.
- Don't divide by zero in progress. Reason: a task with no subtasks must report 0%, not NaN.
- Don't build a tree structure. Reason: model is flat with `parentId` (ADR-005).
- Don't break existing tests.
