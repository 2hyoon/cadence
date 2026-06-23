# Step 7: filter-sort-search

## Files to Read

First, read the files below and understand the project's architecture and design intent:

- `/docs/ARCHITECTURE.md`, `/docs/UI_GUIDE.md`, `/CLAUDE.md` (lib/ is pure)
- `types/todo.ts` (step 1), `lib/views.ts` (step 4), step 5 list UI.

## Task

Add search, filter, and sort — pure logic in `lib/`, plus the in-view UI bar.

1. `lib/filter.ts` — **pure** filtering. Functions take a todo list + criteria and return a filtered list. Support at least: text query (matches title/notes/tags, case-insensitive), priority filter, and tag filter. Define a `FilterCriteria` type.
2. `lib/sort.ts` — **pure** sorting. Support at least: by due date (`YYYY-MM-DD` string compare; undefined due dates sort last), by priority (high→low), and by creation time (`createdAt`). Define a `SortKey` type and a `sortTodos(todos, key, direction)` signature. Sorting must be **stable** and must not mutate the input array.
3. UI: a search/filter/sort bar within the view (above the list). Wire it to apply `filter` then `sort` to the active view's todos before rendering. Keep this state in the container (`features/`), not in `lib/`.

Tests (unit, pure): filter by query/priority/tag (including empty criteria = passthrough); sort by each key + direction; undefined due dates sort last; input array is not mutated.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm run test
```

## Verification Procedure

1. Run the AC commands above.
2. Architecture checklist: `lib/filter.ts` and `lib/sort.ts` are pure (no React/DOM/clock, no mutation); UI state lives in `features/`.
3. Update step 7 in `phases/0-mvp/index.json` (completed + summary: `FilterCriteria`/`SortKey` shapes, function signatures, where the bar state lives). This is the final MVP step.

## Prohibitions

- Don't mutate the input arrays in sort/filter. Reason: purity + predictable React rendering.
- Don't use `Date` parsing to compare due dates. Reason: string compare on `YYYY-MM-DD` (ADR-002).
- Don't break existing tests.
