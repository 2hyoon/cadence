# Cadence

A precise, keyboard-first todo app. Handles the things basic todo apps skip: recurring tasks, subtasks with progress tracking, full undo/redo, and a productivity dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Tests](https://img.shields.io/badge/tests-170%20passing-brightgreen)

---

## Features

- **5 views** — Today, Upcoming, All, Completed, Stats
- **Task management** — due dates with overdue/today/upcoming badges, priority levels (low/medium/high), tags
- **Recurring tasks** — daily, weekly, monthly presets; due date rolls forward on completion
- **Subtasks** — one level deep with progress percentage
- **Undo / Redo** — full snapshot history via ⌘Z / ⌘⇧Z
- **Productivity stats** — completion rate and 7-day completion chart
- **AI natural-language input** — type "submit report friday high priority" and press Enter; Claude parses title, due date, priority, and tags automatically. Falls back to manual entry if unavailable.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Vitest + React Testing Library
- Claude API (`claude-haiku-4-5`) for natural-language parsing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### AI Parsing (optional)

Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without the key the app works fully — AI parsing degrades gracefully to manual entry.

## Usage

| Action | How |
|---|---|
| Add a task | Type in "Add a task…" at the bottom and press **Enter** |
| AI-parse a task | Same input — just describe naturally ("dentist tomorrow 3pm") |
| Quick Add modal | **⌘K** |
| Complete a task | Click the checkbox |
| Undo / Redo | **⌘Z** / **⌘⇧Z** |
| View subtasks / edit | Click a task row |
| Recurring tasks | Edit a task → set recurrence |

## Commands

```bash
npm run dev      # Dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest (170 tests)
```

## Architecture

```
app/api/parse/   # AI route — only place that calls the Claude API
components/      # Presentational (props in, callbacks out)
features/        # Containers that wire components to the store
lib/             # Pure logic — sort, filter, recurrence, stats, history
store/           # Single useReducer + Context
persistence/     # localStorage abstraction (error-absorbing)
types/           # Domain models
```

All business logic lives in `lib/` — pure, deterministic, and independently unit-tested. The store reducer is also pure. The only side effects are in `persistence/storage.ts` and `app/api/parse/route.ts`.
