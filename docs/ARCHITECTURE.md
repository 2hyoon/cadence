# Architecture

## Directory Structure
```
app/
  layout.tsx, page.tsx          # Entry point, mounts the store provider
  api/parse/route.ts            # AI natural-language parsing (the only server logic)
components/                     # Presentational components (props in, callbacks out)
features/                       # Feature composition / containers
lib/                            # Pure logic — primary unit-test target
  recurrence.ts  sort.ts  filter.ts  stats.ts  history.ts  progress.ts  views.ts
store/                          # useReducer + single Context, actions
persistence/                    # storage.ts single module (load/save, error-absorbing)
types/                          # Domain models (Todo, Priority, RecurrenceRule, ...)
```

## Patterns
- Layered by responsibility; each layer maps cleanly to a Harness step.
- `lib/` is pure and deterministic: no React, no DOM, no storage. This is what makes TDD and the acceptance criteria reliable.
- Components are presentational; containers in `features/` wire them to the store.
- Client-only hydration: the server never reads `localStorage`. State loads after mount (skeleton/empty before) to avoid SSR/client markup mismatch.

## Data Flow
```
UI (components / features)
  → store (dispatch)
    → pure transforms in lib/ (recurrence, sort, filter, views, progress, history, stats)
  → persistence/storage.ts  (persist on store-change effect boundary)

AI Quick-Add:
  client → POST /api/parse → Claude API → validated Todo draft → confirm → dispatch
  (no key / failure → graceful fallback to manual Quick-Add)
```

## State Management
- Single `useReducer` + Context in `store/`. Pure reducer; actions: add/edit/toggle/delete (+ recurrence, subtasks, undo/redo as later phases extend it).
- No state/dispatch split or selector hooks — unnecessary at MVP scale.
- Undo/redo via snapshot history (past/future state arrays).
- Recurrence completion appends to a separate `completionLog` (seriesId + date); stats are computed from that log.
