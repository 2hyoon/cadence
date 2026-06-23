# Architecture Decision Records

## Philosophy
MVP first. Minimize external dependencies. Choose the smallest working implementation. Keep pure logic isolated and deterministic so it is testable. No speculative abstraction.

---

### ADR-001: Next.js 15 (App Router) + TypeScript strict + Tailwind + Vitest + ESLint
**Decision**: Use this stack for the app.
**Reason**: First-class TS, App Router for the one server route we need (AI parse), Vitest for fast pure-logic unit tests, ESLint as a guardrail. Clean layering supports "one step = one module".
**Trade-off**: Next.js is heavier than a plain SPA for a localStorage app, but we want a real server boundary for the AI route.

### ADR-002: Date-only `YYYY-MM-DD` due dates
**Decision**: Due dates are date-only strings; Today/overdue/recurrence compare against the user's local midnight.
**Reason**: Avoids timezone/DST math and the complexity of time-of-day scheduling.
**Trade-off**: No hourly reminders or precise scheduling (explicitly out of scope).

### ADR-003: In-place recurrence roll-forward + separate completion log
**Decision**: On completing a recurring task, roll its `dueDate` forward to the next occurrence (daily/weekly/monthly presets) and reset it to incomplete; append the completion (`seriesId` + date) to a separate `completionLog`. Stats are derived from the log.
**Reason**: Keeps a single live task per series (no clutter) while preserving history for stats. Presets only; ends by manual deletion.
**Trade-off**: No per-occurrence task records; no recurrence end conditions (until/count).

### ADR-004: useReducer + single Context, pure reducer
**Decision**: Single `useReducer` + one Context for app state; reducer stays pure.
**Reason**: Pure reducer is trivial to unit-test and harness-friendly. MVP scale doesn't need more.
**Trade-off**: No state/dispatch split or selector hooks; potential re-renders accepted at this scale.

### ADR-005: `crypto.randomUUID()` IDs; flat subtasks via `parentId`
**Decision**: IDs from `crypto.randomUUID()` (SSR-safe). Subtasks are flat with a `parentId`, depth limited to one level.
**Reason**: No ID library dependency; flat model is simpler than a tree and matches one-level subtasks.
**Trade-off**: No arbitrarily nested subtasks.

### ADR-006: Single `persistence/storage.ts` with reset-on-mismatch fallback
**Decision**: One storage module (load/save). A version constant guards shape; on corrupt/mismatched data, reset to empty state. Persist only at the store-change effect boundary.
**Reason**: One implementation, no adapter/interface indirection, no migration function (new app, nothing to migrate). Defensive against corrupt/quota/disabled storage.
**Trade-off**: No data migration path; mismatched data is discarded rather than upgraded.

### ADR-007: Snapshot-based undo/redo
**Decision**: Undo/redo via past/future arrays of full state snapshots.
**Reason**: Simplest correct approach; easy to reason about and test.
**Trade-off**: More memory than a command/diff log — acceptable at MVP scale.

### ADR-008: AI parse via `app/api/parse`, dependency-free validation, manual fallback
**Decision**: Natural-language Quick-Add calls Claude API only from the route handler; responses are hand-validated (no zod). Missing key / failure falls back to manual Quick-Add. AC tests mock the Claude call.
**Reason**: Keeps the API key server-side, avoids a schema dependency, and keeps the app usable offline. The missing-key path is the Harness `blocked` demo.
**Trade-off**: Hand-validation is less expressive than a schema library; runtime AI demo requires `ANTHROPIC_API_KEY`.
