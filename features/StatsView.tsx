"use client";

import { computeStats } from "../lib/stats";
import type { AppState } from "../types/todo";

interface StatsViewProps {
  state: AppState;
  today: string;
}

export function StatsView({ state, today }: StatsViewProps) {
  const stats = computeStats(state, today, 7);
  const ratePercent = Math.round(stats.completionRate * 100);
  const maxCount = Math.max(...stats.recentDays.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Completion rate */}
      <section className="rounded-xl bg-[#f7f4ed] border border-[#eceae4] p-6">
        <p className="text-xs font-medium text-[#5f5f5d] uppercase tracking-wider mb-3">
          Completion Rate
        </p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-semibold text-[#1c1c1c]">{ratePercent}%</span>
          <span className="text-sm text-[#5f5f5d]">
            {stats.completedCount} of {stats.totalCount} tasks done
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full bg-[rgba(28,28,28,0.08)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1c1c1c] transition-none"
            style={{ width: `${ratePercent}%` }}
          />
        </div>
      </section>

      {/* Recent completions */}
      <section className="rounded-xl bg-[#f7f4ed] border border-[#eceae4] p-6">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-xs font-medium text-[#5f5f5d] uppercase tracking-wider">
            Last 7 Days
          </p>
          <span className="text-sm text-[#5f5f5d]">
            {stats.recentTotal} completions
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-24">
          {stats.recentDays.map((day) => {
            const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isToday = day.date === today;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-sm transition-none ${isToday ? "bg-[#1c1c1c]" : "bg-[rgba(28,28,28,0.15)]"}`}
                    style={{ height: `${Math.max(heightPercent, day.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[rgba(28,28,28,0.4)] text-xs">
                  {day.date.slice(5).replace("-", "/")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Per-day count row */}
        <div className="mt-3 flex gap-1.5">
          {stats.recentDays.map((day) => (
            <div key={day.date} className="flex-1 text-center">
              <span className={`text-xs ${day.count > 0 ? "text-[#1c1c1c]" : "text-[rgba(28,28,28,0.2)]"}`}>
                {day.count > 0 ? day.count : "·"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
