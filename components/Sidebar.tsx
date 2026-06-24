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
                ? "text-[#1c1c1c] bg-[rgba(28,28,28,0.06)]"
                : "text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export function MobileTabs({ activeView, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden flex gap-1 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={[
            "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            activeView === item.id
              ? "text-[#1c1c1c] bg-[rgba(28,28,28,0.06)]"
              : "text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
