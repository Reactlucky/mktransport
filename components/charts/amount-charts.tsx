"use client";

import { useState, type MouseEvent } from "react";
import { formatCurrency } from "@/lib/utils";

function barWidth(value: number, max: number): string {
  if (max <= 0 || value <= 0) return "0%";
  return `${Math.max(2, (value / max) * 100)}%`;
}

export function AmountBars({
  label,
  rows,
}: {
  label: string;
  rows: { id: string; label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 0);

  return (
    <div className="mb-4 rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="mb-3 text-sm font-medium">{label}</p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{row.label}</span>
              <span className="shrink-0 tabular text-muted-foreground">
                {formatCurrency(row.value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-[3px] bg-muted">
              <div
                className="h-full rounded-[3px] bg-primary"
                style={{ width: barWidth(row.value, max) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyRentChart({
  days,
  today,
}: {
  days: { date: string; day: number; rent: number }[];
  today: string;
}) {
  const max = Math.max(...days.map((day) => day.rent), 0);
  const [tip, setTip] = useState<{ x: number; y: number; index: number } | null>(null);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const plot = event.currentTarget;
    const bounds = plot.getBoundingClientRect();
    const contentX = event.clientX - bounds.left + plot.scrollLeft;
    const index = Math.min(
      days.length - 1,
      Math.max(0, Math.floor((contentX / plot.scrollWidth) * days.length))
    );
    setTip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      index,
    });
  }

  return (
    <div
      className="rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <p className="mb-3 text-sm font-medium">Daily rent</p>
      <div
        className="relative overflow-x-auto"
        onMouseMove={onMove}
        onMouseLeave={() => setTip(null)}
      >
        {tip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[4px] bg-[#0b1f3a] px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
            style={{ left: tip.x, top: Math.max(tip.y - 8, 18) }}
          >
            {days[tip.index].day} · {formatCurrency(days[tip.index].rent)}
          </div>
        )}
        <div className="flex h-40 min-w-[40rem] items-end gap-1 sm:min-w-0">
          {days.map((day, index) => {
            const height = max > 0 ? (day.rent / max) * 100 : 0;
            const isToday = day.date === today;
            const active = tip?.index === index;
            return (
              <div
                key={day.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div className="flex h-28 w-full items-end">
                  <div
                    className={
                      isToday
                        ? "w-full rounded-t-[3px] bg-navy"
                        : active
                          ? "w-full rounded-t-[3px] bg-[#1d4ed8]"
                          : "w-full rounded-t-[3px] bg-primary"
                    }
                    style={{ height: day.rent > 0 ? `${Math.max(height, 6)}%` : "2px" }}
                  />
                </div>
                <span
                  className={
                    isToday
                      ? "text-[10px] font-semibold text-navy"
                      : "text-[10px] text-muted-foreground"
                  }
                >
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SalarySplitChart({
  rows,
}: {
  rows: {
    id: string;
    label: string;
    paid: number;
    advance: number;
    remaining: number;
    started: boolean;
  }[];
}) {
  return (
    <div
      className="mb-4 rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Paid, advance, and remaining</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Paid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-warning" /> Advance
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-muted ring-1 ring-border" /> Remaining
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const total = row.paid + row.advance + row.remaining;
          return (
            <div key={row.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium">{row.label}</span>
                <span className="shrink-0 text-muted-foreground">
                  {row.started ? formatCurrency(row.remaining) + " left" : "Not started"}
                </span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-[3px] bg-muted">
                {row.started && total > 0 && (
                  <>
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(row.paid / total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-warning"
                      style={{ width: `${(row.advance / total) * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
