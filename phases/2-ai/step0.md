# Step 0: ai-parse-api

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/CLAUDE.md` (CRITICAL: external API calls only in `app/api/`)
- `/docs/ADR.md` (ADR-008 AI parse via route handler, dependency-free validation, manual fallback)
- `types/todo.ts` (the `Todo` shape the draft must conform to)
- For the Claude API (model id, request shape, params): consult the `claude-api` skill. Use a small fast model for parsing — `claude-haiku-4-5` is recommended.

## Task

Create `app/api/parse/route.ts` — a POST handler that turns natural language ("meeting tomorrow 3pm", "submit report friday high priority") into a **structured Todo draft**.

1. Input: `{ text: string }`. Enforce a reasonable length limit (e.g. reject > 500 chars with 400). Today's date should be resolved server-side (or accepted from the client) and given to the model so relative dates ("tomorrow", "friday") map to `YYYY-MM-DD`.
2. Call the Claude API (key from `process.env.ANTHROPIC_API_KEY`) and ask it to return JSON with: `title`, optional `dueDate` (`YYYY-MM-DD`, date-only — drop any time-of-day), `priority`, `tags`. 
3. **Dependency-free validation** (no zod): hand-validate the model's JSON — coerce/whitelist `priority`, verify `dueDate` matches `^\d{4}-\d{2}-\d{2}$` (else drop it), ensure `title` is a non-empty string, `tags` is a string array. Return a clean draft `{ title, dueDate?, priority, tags }`.
4. Error handling (return JSON + appropriate status, never crash): network/timeout, 401/429 from the API, and malformed/unparseable LLM JSON → respond with an error the client can detect to fall back to manual entry.

### THIS STEP IS THE `blocked` DEMO
At the **start** of the step, check whether `ANTHROPIC_API_KEY` is present in the environment. If it is **absent**, you cannot run/verify the live route. In that case:
- Still write the route and the mocked AC tests (so the code is complete), **then** set this step to `blocked`:
  - In `phases/2-ai/index.json`, set step 0 `"status": "blocked"` with `"blocked_reason": "ANTHROPIC_API_KEY not set in environment; cannot run the live AI parse route. Set the key, then reset status to pending and rerun."`
  - Stop immediately after recording it.
- If the key **is** present, finish normally and mark `completed`.

The AC tests must **mock the Claude call** so they pass with no key (CI-safe). Only the live runtime demo needs the real key.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```
(Tests mock the Claude SDK/fetch — they must pass without `ANTHROPIC_API_KEY`.)

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: Claude is called **only** here (not from any client component); validation is dependency-free; date-only enforced; errors return JSON without crashing.
3. Update step 0 in `phases/2-ai/index.json`:
   - Key present + AC passes → `"completed"` + summary (route path, request/response shape, model used, how the call is mocked).
   - Key absent → `"blocked"` + the `blocked_reason` above, then stop.
   - AC failing after 3 attempts → `"error"` + `error_message`.

## Prohibitions

- Don't call the Claude API from a client component or expose the key to the client. Reason: CLAUDE.md CRITICAL rule + key safety.
- Don't add zod or another schema library. Reason: ADR-008 hand-validation.
- Don't require a real API key for the unit tests to pass. Reason: AC must be CI-safe; mock the call.
- Don't emit a `dueDate` with a time component. Reason: ADR-002 date-only.
- Don't break existing tests.
