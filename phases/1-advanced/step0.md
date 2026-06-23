# Step 0: recurrence

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/CLAUDE.md`
- `/docs/ADR.md` (ADR-003 in-place roll-forward + separate completion log)
- `types/todo.ts` (Todo, RecurrenceRule, CompletionLogEntry, AppState)
- `store/reducer.ts` and action creators (phase 0 step 3)
- `lib/views.ts` (phase 0 step 4) for the date-string conventions

## Task

Implement recurring tasks. **Write the tests first (TDD)** — the month-end / leap-year cases are the point.

1. `lib/recurrence.ts` — **pure** date math on date-only `YYYY-MM-DD` strings:
   - `nextDueDate(dueDate: string, preset: RecurrencePreset): string` — returns the next occurrence.
     - `daily` → +1 day. `weekly` → +7 days. `monthly` → +1 month, **clamped to the last valid day** of the target month (e.g. `2025-01-31` + monthly → `2025-02-28`; in a leap year → `2025-... ` handle `2024-01-31` → `2024-02-29`).
   - Operate on the calendar date only. You may use `Date` **internally** for arithmetic, but construct it at UTC midnight (`Date.UTC`) and format back to `YYYY-MM-DD`, so there is no timezone/DST drift. Do not accept or emit datetimes.
2. Reducer / action wiring for "complete a recurring task": when a todo with a `recurrence` (and `seriesId`) is toggled complete:
   - Append a `CompletionLogEntry` `{ seriesId, date }` to `completionLog` (date = the occurrence's `dueDate`, or the passed-in "today" if no due date — decide and document).
   - **Roll the same todo forward in place**: set `dueDate = nextDueDate(...)` and reset `completed` to `false` (the series stays a single live task — ADR-003).
   - Keep the reducer pure: pass the "completion date" in via the action payload, not by reading the clock in the reducer.
3. UI: a recurrence indicator (↻) on recurring task rows, and a control in `TaskDetail` to set/clear the preset (daily/weekly/monthly/none).

Tests (unit, pure — write first): `nextDueDate` for daily/weekly/monthly; month-end clamp (Jan 31 → Feb 28/29); leap year; reducer appends to `completionLog` and rolls the due date forward + resets completion; toggling a non-recurring task is unchanged; double-completion produces two distinct log entries.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: `lib/recurrence.ts` is pure and deterministic (no ambient clock); reducer stays pure; matches ADR-003.
3. Update step 0 in `phases/1-advanced/index.json` (completed + summary: `nextDueDate` signature, the new/changed action, how completion date is supplied).

## Prohibitions

- Don't create a new task per occurrence. Reason: ADR-003 rolls the same task forward in place.
- Don't read the clock inside the reducer or `lib/recurrence.ts`. Reason: determinism for tests.
- Don't use local-time `new Date(string)` parsing for the math. Reason: timezone/DST can shift the date; use UTC.
- Don't add recurrence end conditions. Reason: ADR-003 presets only.
- Don't break existing tests.
