# Step 2: persistence

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md` (ADR-006 single storage module + reset-on-mismatch)
- `/CLAUDE.md` (CRITICAL: only this module touches localStorage)
- `types/todo.ts` (from step 1 — `AppState`, `isAppState`)

## Task

Create the single persistence module `persistence/storage.ts`. This is the **only** module allowed to touch `localStorage`.

Interface (signatures; you implement the bodies):

- `const STORAGE_KEY: string` and `const STORAGE_VERSION: number` — a versioned envelope, e.g. stored value is `{ version: STORAGE_VERSION, state: AppState }`.
- `loadState(): AppState` — returns the persisted state, or a fresh empty state `{ todos: [], completionLog: [] }` when anything is wrong.
- `saveState(state: AppState): void` — persists the state inside the versioned envelope.
- `emptyState(): AppState` — the canonical empty state.

Core rules (must not deviate):

- **SSR-safe**: guard every access with `typeof window === "undefined"` (and absence of `localStorage`). On the server, `loadState()` returns `emptyState()` and `saveState()` is a no-op. Reason: the server has no `localStorage` and must not throw.
- **Absorb all errors**: wrap reads/writes in try/catch. Handle corrupt JSON, version mismatch, failed `isAppState` validation, disabled storage (private mode), and quota-exceeded on save. On any read problem → return `emptyState()`. On any write problem → swallow and continue (never throw to the caller).
- **Reset on mismatch**: if the envelope version differs from `STORAGE_VERSION` or the payload fails `isAppState`, discard it and return `emptyState()`. No migration function (ADR-006).

Unit tests (mock `localStorage`, e.g. via a fake on `globalThis`): valid round-trip; corrupt JSON → empty; version mismatch → empty; `isAppState` failure → empty; `saveState` swallowing a thrown quota error; SSR path (no `window`) → empty / no-op.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: only this module references `localStorage`; SSR guard present; matches ADR-006.
3. Update step 2 in `phases/0-mvp/index.json` (completed + summary: exported functions, `STORAGE_KEY`/`STORAGE_VERSION`, how localStorage is mocked in tests).

## Prohibitions

- Don't let any error propagate to the caller. Reason: the app must never crash on storage failure (CLAUDE.md defensive rule).
- Don't write a migration function. Reason: ADR-006 — new app, reset instead.
- Don't access `localStorage` without the `typeof window` guard. Reason: SSR will throw.
- Don't break existing tests.
