# PRD: Cadence

## Goal
A precise, keyboard-first todo app that handles the things basic todo apps don't: recurring tasks, subtasks with progress, undo/redo, and a productivity dashboard — without ceremony.

## Users
Individuals who run their day from a task list and want repeating routines, breakdown of larger tasks, and a sense of momentum (completion stats), all driven from the keyboard.

## Core Features
1. Primary views: Today, Upcoming, All, Completed, Stats (sidebar).
2. Task CRUD with date-only due dates and overdue/today/upcoming badges.
3. Global ⌘K Quick-Add (keyboard-first; manual fields, AI-assisted parsing as an enhancement).
4. Recurring tasks (daily/weekly/monthly presets) — on completion the due date rolls forward in place and a completion is appended to a separate log.
5. Subtasks (one level deep) with progress percentage.
6. Undo / redo (⌘Z / ⌘⇧Z) via snapshot history.
7. Productivity stats from the completion log (completion rate + recent counts).
8. AI natural-language Quick-Add ("meeting tomorrow 3pm") via `app/api/parse` (graceful manual fallback when unavailable).

## Out of Scope for MVP
- Time-of-day scheduling, reminders, notifications.
- Recurrence end conditions (until/count); nested subtasks beyond one level.
- Multi-device sync, accounts, multi-tab synchronization.
- Streaks / trend lines in stats (completion rate + recent counts only).
- Schema migration tooling (new app — no legacy data to migrate).

## Design
- Warm light, minimal, tool-like (a dashboard used daily, not a marketing page).
- Monochrome warm neutrals on an off-white canvas; semantic color reserved for state.
- Keyboard-first interactions; responsive (sidebar collapses to bottom tabs on mobile).
