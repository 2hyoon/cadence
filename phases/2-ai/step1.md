# Step 1: quick-add-ai

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `/docs/ADR.md` (ADR-008 manual fallback)
- The Quick-Add component from phase 0 step 6 (and its draft-submit seam)
- `app/api/parse/route.ts` (phase 2 step 0) — the request/response shape
- `store/` action creators, `types/todo.ts`

## Task

Enhance the ⌘K Quick-Add (phase 0 step 6) with natural-language parsing.

1. Add a natural-language input mode to Quick-Add: the user types free text and triggers "parse" (e.g. a button or Enter in NL mode). The client `POST`s `{ text }` to `/api/parse`.
2. On success: pre-fill the existing Quick-Add manual fields (title/dueDate/priority/tags) with the returned draft so the user can review/edit, then confirm to add (reusing the step 6 draft-submit seam). Do not add silently — always show the draft for confirmation.
3. **Graceful fallback** (the UX pair of the `blocked` path): if `/api/parse` returns an error or is unreachable (no key, network failure, bad response), fall back to the **manual** Quick-Add from step 6 with a brief, non-alarming notice. The app must remain fully usable without AI.
4. Show a lightweight loading state while parsing; keep it keyboard-first.

Tests (React Testing Library, **mock `fetch`**): successful parse pre-fills the fields and confirming adds the task; an error response falls back to manual entry and the user can still add a task manually; loading state renders during the in-flight request.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```
(fetch is mocked — no network or API key required.)

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: the client calls `/api/parse` (not the Claude API directly); manual fallback works on any failure; reuses the step 6 add path.
3. Update step 1 in `phases/2-ai/index.json` (completed + summary: how NL mode integrates with step 6, fallback behavior, how fetch is mocked). Final step of the project.

## Prohibitions

- Don't call the Claude API directly from the client. Reason: must go through `/api/parse` (CLAUDE.md).
- Don't add the parsed task without a confirmation step. Reason: parsing is best-effort; the user reviews the draft.
- Don't break the manual Quick-Add path. Reason: it's the required fallback when AI is unavailable.
- Don't require a real API key for tests. Reason: AC must be CI-safe; mock fetch.
- Don't break existing tests.
