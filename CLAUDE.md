# Project: Cadence

A precise, keyboard-first todo app (recurrence / subtasks / undo-redo / productivity stats).
Built as a testbed for the Harness framework: clean layers so one step = one self-contained module.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Vitest (unit) + React Testing Library (component)
- ESLint

## Language Policy (CRITICAL)
- All docs, code, UI strings, identifiers, comments, and commit messages are written in **English**.
- The only exception is `plan.md` (Korean planning artifact). Do not translate or modify `plan.md`.

## Architecture Rules
- CRITICAL: External API calls (Claude API) happen **only** in `app/api/` route handlers. Never call external APIs directly from client components.
- CRITICAL: Pure logic lives in `lib/` and must **not** depend on React, the DOM, or storage. It must be deterministic so it can be unit-tested in isolation.
- Persistence goes through the single module `persistence/storage.ts` (load/save). No other module touches `localStorage` directly.
- State is managed by a single `useReducer` + Context in `store/`. The reducer must stay **pure** (no side effects, no I/O).
- Components in `components/` are presentational (props in, callbacks out). Feature composition/containers go in `features/`. Domain types go in `types/`.
- Dates are date-only `YYYY-MM-DD` strings. Compare against the user's local midnight. No time-of-day, no timezone math.

## Development Process
- CRITICAL: New features are TDD — write the tests first, then the implementation that makes them pass.
- Defensive by default: storage and the AI route must absorb errors (corrupt JSON, quota, disabled storage, network/timeout/bad LLM output) and never crash the app.
- Commit messages follow conventional commits (feat:, fix:, docs:, chore:, refactor:).

## Commands
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest (CI mode, non-watch)
