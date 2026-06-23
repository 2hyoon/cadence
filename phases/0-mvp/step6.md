# Step 6: quick-add

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md`
- `types/todo.ts` (step 1), `store/` (step 3), step 5 components/containers.

## Task

Build a global, keyboard-first Quick-Add.

1. A `⌘K` (and `Ctrl+K`) global shortcut opens a Quick-Add modal/palette from anywhere in the app. `Esc` closes it; `Enter` submits.
2. The modal has **manual fields**: title (required), optional due date (`YYYY-MM-DD`), priority, tags. On submit it creates a todo via the step 3 action creators and closes.
3. This is the MVP input path that works **without AI** — the AI enhancement (`/api/parse`) is a later phase. Keep the seam clean (e.g. a single submit handler that takes a draft `Todo`) so phase 2 can pre-fill the fields from a parsed draft, but do not call any API here.
4. Style per UI_GUIDE (slide-up, accent primary button, no forbidden patterns).

Tests (React Testing Library): pressing the shortcut opens the modal; submitting with a title adds the task and closes; Esc closes without adding; empty title is rejected.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: no external API calls here; uses action creators; keyboard handling is global and cleaned up on unmount.
3. Update step 6 in `phases/0-mvp/index.json` (completed + summary: component name, the shortcut handling location, and the draft-submit seam phase 2 will reuse).

## Prohibitions

- Don't call any network/API here. Reason: AI parsing is phase 2; this step must work offline.
- Don't leave a global key listener attached after unmount. Reason: leaks/duplicate handlers.
- Don't break existing tests.
