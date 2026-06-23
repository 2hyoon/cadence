# Step 0: project-setup

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`

This is the first code step. The repo currently contains only docs, the Harness scaffold (`scripts/`, `.claude/`), and `phases/`. There is no `package.json` yet.

## Task

Initialize a Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS project **in the repository root** (not a subfolder). Add Vitest + React Testing Library and ESLint.

1. Create `package.json` named `cadence` with these scripts (exact names — the Stop hook runs all three every turn):
   - `dev` → `next dev`
   - `build` → `next build`
   - `lint` → `next lint` (or `eslint .`)
   - `test` → Vitest in **non-watch / CI mode** (e.g. `vitest run`). It must exit on its own, never watch.
2. Configure TypeScript in **strict** mode (`tsconfig.json`).
3. Configure Tailwind CSS (v3 or v4 — your choice; wire it into a global stylesheet imported by `app/layout.tsx`).
4. Configure Vitest with `jsdom` environment + React Testing Library so component tests can run. Add a `vitest.config.ts` (or equivalent) and any setup file needed.
5. Create a minimal `app/layout.tsx` and `app/page.tsx` so `next build` succeeds.
6. Add exactly **one trivial passing test** (e.g. `lib/__tests__/smoke.test.ts` asserting `1 + 1 === 3`-style sanity → make it pass) to prove `npm run test` is green.

Keep dependencies minimal. Do not add state libraries, UI kits, date libraries, or zod.

## Acceptance Criteria

```bash
npm install
npm run lint && npm run build && npm run test
```

All three must pass (green).

## Verification Procedure

1. Run the AC commands above.
2. Check the architecture checklist:
   - Project is at the repo root; layout matches `/docs/ARCHITECTURE.md`.
   - TypeScript strict is on; tech stack matches the ADR (no extra deps).
   - No CRITICAL rule in `/CLAUDE.md` is violated.
3. Update step 0 in `phases/0-mvp/index.json`:
   - Success → `"status": "completed"`, `"summary": "..."` (note the package manager, test runner config path, and how Tailwind is wired).
   - Failing after 3 attempts → `"status": "error"`, `"error_message": "..."`.
   - User intervention needed → `"status": "blocked"`, `"blocked_reason": "..."`, then stop.

## Prohibitions

- Don't scaffold into a subdirectory (e.g. `cadence/`). Reason: the Harness, `.gitignore`, and later steps assume the app lives at the repo root.
- Don't set up `test` in watch mode. Reason: the executor invokes it non-interactively; a watcher hangs the session.
- Don't add dependencies beyond the stack in the ADR. Reason: ADR-001 mandates a minimal stack.
- Don't break existing tests.
