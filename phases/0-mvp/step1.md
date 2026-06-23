# Step 1: core-types

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md` (ADR-002 date-only, ADR-003 recurrence + completion log, ADR-005 IDs + flat subtasks)
- `/CLAUDE.md`
- `package.json`, `tsconfig.json` (from step 0)

## Task

Create the domain model in `types/todo.ts`. Define the types and a few type guards. Leave room for later phases (recurrence, subtasks) but do **not** implement any logic here — types and guards only.

Required shapes (interface-level; exact field names matter, you choose the precise TS expression):

- `Priority` — union: `"low" | "medium" | "high"`.
- `Tag` — a string label (alias is fine).
- `RecurrencePreset` — union: `"daily" | "weekly" | "monthly"`.
- `RecurrenceRule` — `{ preset: RecurrencePreset }` (presets only; no until/count — ADR-003).
- `Todo`:
  - `id: string` (from `crypto.randomUUID()` at creation; not generated here)
  - `title: string`
  - `notes?: string`
  - `dueDate?: string` — **date-only `YYYY-MM-DD`** (ADR-002); never a full ISO datetime
  - `priority: Priority`
  - `tags: Tag[]`
  - `completed: boolean`
  - `parentId?: string` — present on subtasks; flat, one level deep (ADR-005)
  - `seriesId?: string` — present on recurring tasks; groups completions in the log
  - `recurrence?: RecurrenceRule`
  - `createdAt: string` — ISO timestamp (creation time ordering)
- `CompletionLogEntry` — `{ seriesId: string; date: string }` where `date` is `YYYY-MM-DD` (ADR-003).
- `AppState` — `{ todos: Todo[]; completionLog: CompletionLogEntry[] }` (the persisted/managed shape).

Type guards (pure, no deps): at minimum `isTodo(value: unknown): value is Todo` and `isAppState(value: unknown): value is AppState`. These will be used by `persistence/storage.ts` (step 2) to validate loaded data, so they must reject malformed/partial objects.

Add unit tests for the guards (valid object passes; missing/wrong-typed fields fail).

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: types only (no React/DOM/storage); date fields documented as `YYYY-MM-DD`; matches the ADR.
3. Update step 1 in `phases/0-mvp/index.json` (completed + summary listing the exported type names and guard names / or error / or blocked).

## Prohibitions

- Don't add a `dueTime` or datetime field. Reason: ADR-002 is date-only.
- Don't add recurrence end conditions (until/count). Reason: ADR-003 presets only.
- Don't put any logic (sorting, recurrence math, persistence) here. Reason: that belongs in `lib/` and `persistence/` in later steps.
- Don't break existing tests.
