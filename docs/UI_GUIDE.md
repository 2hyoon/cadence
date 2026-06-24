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

Warm light theme: an off-white canvas with dark warm-ink text. Set globally in `app/globals.css`.

### Background
| Use | Value |
|------|------|
| Page | #f7f4ed |
| Card | #f7f4ed (border #eceae4) |

### Text
| Use | Value |
|------|------|
| Primary text | #1c1c1c |
| Secondary | #5f5f5d |
| Muted / Disabled | rgba(28,28,28,0.3) |

### Data/Semantic Colors
| Use | Value |
|------|------|
| Primary action / active ink | #1c1c1c |
| Active view background | rgba(28,28,28,0.06) |
| Overdue / Error | #ef4444 (red-500) |
| Focus ring | rgba(59,130,246,0.5) |

> Monochrome warm ink; semantic color reserved for state. Due-date badges: overdue = red-500, today = #1c1c1c, upcoming = #5f5f5d. Completed tasks always render the date in #5f5f5d regardless of due status. Priority dots: high = red-500, medium = #1c1c1c, low = rgba(28,28,28,0.3).

## Components
### Card
```
rounded-lg bg-[#f7f4ed] border border-[#eceae4] p-4
```

### Button
```
Primary: rounded-md bg-[#1c1c1c] text-[#fcfbf8] btn-inset   (see globals.css)
Text:    text-[#5f5f5d] hover:text-[#1c1c1c]
```

### Input Field
```
rounded-lg bg-[#fcfbf8] border border-[#eceae4] px-4 py-3 text-[#1c1c1c] placeholder-[#5f5f5d] input-ring
```
> Near-white fill (#fcfbf8) reads as an interactive field against the beige canvas. Focus uses the `.input-ring` utility (blue ring) from `globals.css`.

## Layout
- Full width: max-w-5xl content column.
- Alignment: left-aligned by default. No center alignment of content.
- Spacing: gap-3~4, space-y-6~8 between sections.
- Shell: persistent sidebar (Today / Upcoming / All / Completed / Stats) on desktop; collapses to a bottom tab bar on mobile.

## Typography
| Use | Style |
|------|--------|
| Page title | text-2xl font-semibold text-[#1c1c1c] |
| Card title | text-sm font-medium text-[#1c1c1c] |
| Body | text-sm text-[#1c1c1c] leading-relaxed |

## Animation
- Allowed: fade-in (0.2s), slide-up for Quick-Add / toast (0.2s).
- All other animations forbidden (no glow, no looping motion).

## Icons
- Inline SVG, strokeWidth 1.5.
- Do not wrap icons in a container (no rounded background box).
