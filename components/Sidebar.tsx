"use client";

import type { ViewId } from "../lib/views";

export interface NavItem {
  id: ViewId | "stats";
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "stats", label: "Stats" },
];

interface SidebarProps {
  activeView: ViewId | "stats";
  onSelect: (view: ViewId | "stats") => void;
}

export function Sidebar({ activeView, onSelect }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Primary navigation"
        className="hidden md:flex flex-col gap-1 w-44 shrink-0 pt-2"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={[
              "text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === item.id
                ? "text-amber-500 bg-neutral-800"
                : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-900",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Primary navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-neutral-800 flex"
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={[
              "flex-1 py-3 text-xs font-medium transition-colors",
              activeView === item.id
                ? "text-amber-500"
                : "text-neutral-500 hover:text-neutral-300",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
