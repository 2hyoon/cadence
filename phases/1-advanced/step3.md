# Step 3: stats

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `/docs/ADR.md` (ADR-003 stats derived from `completionLog`)
- `types/todo.ts` (CompletionLogEntry, AppState), `lib/views.ts`, the Stats sidebar item from phase 0 step 4

## Task

Implement the productivity dashboard.

1. `lib/stats.ts` — **pure** aggregation over `AppState`, with "today" passed in as a `YYYY-MM-DD` argument:
   - Completion rate over current todos: `done / total` (guard `total === 0` → 0). Decide and document whether "done" counts currently-completed todos.
   - Recent completion counts from `completionLog`: e.g. completions per day for the last N days (default 7), and a total in the window. Group by the `date` field.
   - Define a `Stats` result type. No streaks, no trend lines (out of scope per PRD).
2. UI: the Stats view renders the dashboard — completion rate and the recent counts (simple bars or numbers per UI_GUIDE; no glow/gradient). Use the accent color for the primary metric.

Tests (unit, pure): empty data → 0% and zero counts (no divide-by-zero, no NaN); completion rate with a mix of done/undone; recent counts group correctly by date and respect the window boundary.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: `lib/stats.ts` is pure (clock passed in), derives recent counts from `completionLog` (ADR-003); UI follows UI_GUIDE.
3. Update step 3 in `phases/1-advanced/index.json` (completed + summary: `Stats` shape, `lib/stats.ts` signatures, window default). Final advanced step.

## Prohibitions

- Don't compute streaks or trend lines. Reason: out of scope (PRD).
- Don't divide by zero / emit NaN on empty data. Reason: must render cleanly at zero state.
- Don't read the clock inside `lib/stats.ts`. Reason: determinism for tests.
- Don't break existing tests.
