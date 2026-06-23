# UI Design Guide

## Design Principles
1. It should look like a tool — a dashboard used every day, not a marketing page.
2. Keyboard-first: every primary action has a shortcut (⌘K add, ⌘Z/⌘⇧Z undo/redo). The mouse is optional.
3. Information density over decoration: clear hierarchy, restrained color, no ornamental motion.

## AI Slop Anti-patterns — Don't Do This
| Forbidden | Reason |
|-----------|--------|
| backdrop-filter: blur() | Glass morphism is the most common tell of AI templates |
| gradient-text (gradient background text) | The #1 trait of AI-generated SaaS landing pages |
| "Powered by AI" badge | Decoration, not a feature. No value to users |
| box-shadow glow animation | Neon glow = AI slop |
| Purple/indigo brand colors | The "AI = purple" cliché |
| Same rounded-2xl on every card | Uniform rounded corners feel like a template |
| Background gradient orb (blur-3xl circle) | Decoration found on every AI landing page |

## Colors
### Background
| Use | Value |
|------|------|
| Page | #0a0a0a |
| Card | #141414 |

### Text
| Use | Value |
|------|------|
| Primary text | text-white |
| Body | text-neutral-300 |
| Secondary | text-neutral-400 |
| Disabled | text-neutral-500 |

### Data/Semantic Colors
| Use | Value |
|------|------|
| Accent (primary action, active view) | #f59e0b (amber) |
| Overdue / Error | #ef4444 |
| Completed / Success | #22c55e |
| Neutral / Default | #525252 |

> Single accent (amber). Due-date badges: overdue = red, today = amber, upcoming = neutral.

## Components
### Card
```
rounded-lg bg-[#141414] border border-neutral-800 p-4
```

### Button
```
Primary: rounded-lg bg-amber-500 text-black hover:bg-amber-400
Text:    text-neutral-500 hover:text-neutral-300
```

### Input Field
```
rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 focus:border-neutral-600
```

## Layout
- Full width: max-w-5xl content column.
- Alignment: left-aligned by default. No center alignment of content.
- Spacing: gap-3~4, space-y-6~8 between sections.
- Shell: persistent sidebar (Today / Upcoming / All / Completed / Stats) on desktop; collapses to a bottom tab bar on mobile.

## Typography
| Use | Style |
|------|--------|
| Page title | text-2xl font-semibold text-white |
| Card title | text-sm font-medium text-neutral-300 |
| Body | text-sm text-neutral-300 leading-relaxed |

## Animation
- Allowed: fade-in (0.2s), slide-up for Quick-Add / toast (0.2s).
- All other animations forbidden (no glow, no looping motion).

## Icons
- Inline SVG, strokeWidth 1.5.
- Do not wrap icons in a container (no rounded background box).
