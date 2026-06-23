# Step 4: app-shell-views

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`
- `/docs/ADR.md` (ADR-002 date-only / local-midnight comparison)
- `/CLAUDE.md` (lib/ is pure — no React/DOM)
- `types/todo.ts` (step 1), `store/` (step 3)

## Task

Build the App Shell, the primary-view classifier, and the empty/onboarding state.

1. `lib/views.ts` — **pure** classification of todos into views. Functions are deterministic; pass "today" as a `YYYY-MM-DD` argument (don't read the clock inside `lib/`).
   - `type ViewId = "today" | "upcoming" | "all" | "completed"` (note: "stats" is a view in the shell but renders a dashboard later — no classifier needed here).
   - `classify(todos: Todo[], today: string)` (or per-view helpers): **Today** = incomplete with `dueDate <= today` (includes overdue); **Upcoming** = incomplete with `dueDate > today`; **All** = all incomplete (or all — your call, document it); **Completed** = completed. Subtasks (`parentId` set) are excluded from top-level view lists (they render under their parent in step 5).
   - Also expose a helper to compute a due-date status for a single todo: `dueStatus(dueDate: string | undefined, today: string): "overdue" | "today" | "upcoming" | "none"`.
   - Compare dates as plain `YYYY-MM-DD` strings (lexicographic compare is correct for this format) — do **not** construct `Date` objects for comparison. Reason: avoids timezone/DST drift (ADR-002).
2. App Shell layout (Client Components under `app/` + `components/`):
   - Persistent sidebar with the five primary views (Today / Upcoming / All / Completed / Stats), active item uses the accent color (UI_GUIDE).
   - A content area that shows the selected view's list (placeholder rows are fine here; real task rows come in step 5). Track the selected view in local component state.
   - Responsive: sidebar collapses to a bottom tab bar on mobile (UI_GUIDE).
   - Wrap the app in the `TodoProvider` from step 3 (mount in `app/layout.tsx` or `app/page.tsx`).
3. Empty state + onboarding: when `hydrated` and there are no todos, show an empty state. Provide a small set of sample todos the user can insert with one click (onboarding) — generated via the step 3 action creators.
4. Pre-hydration: show a skeleton/empty placeholder while `!hydrated` (no flicker, no SSR mismatch).

Tests: unit tests for `lib/views.ts` (today/overdue boundary, upcoming, no-due-date, subtasks excluded). One React Testing Library test for the shell (renders the five views; switching the active view changes the heading).

Compute "today" as a local-midnight `YYYY-MM-DD` in a small client helper (e.g. in `components`/`features`), then pass it into `lib/views.ts`.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: `lib/views.ts` is pure (clock passed in); shell uses UI_GUIDE colors/spacing; provider mounted; client-only hydration respected.
3. Update step 4 in `phases/0-mvp/index.json` (completed + summary: `ViewId`, `classify`/`dueStatus` signatures, shell component paths, today-helper location).

## Prohibitions

- Don't read the system clock inside `lib/views.ts`. Reason: it must be pure/deterministic for tests.
- Don't construct `Date` objects to compare due dates. Reason: string compare on `YYYY-MM-DD` avoids timezone bugs (ADR-002).
- Don't use forbidden UI patterns (glass blur, gradient text, glow, purple). Reason: UI_GUIDE anti-patterns.
- Don't break existing tests.
