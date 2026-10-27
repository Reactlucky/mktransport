"use client";

import { useState, type MouseEvent } from "react";
import type { AttendanceStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  half_day: "Half day",
  leave: "Leave",
  absent: "Absent",
};

const DAY_TONE: Record<AttendanceStatus, string> = {
  present:
    "bg-[color-mix(in_srgb,var(--success)_16%,white)] text-success dark:bg-[color-mix(in_srgb,var(--success)_24%,transparent)]",
  half_day:
    "bg-[color-mix(in_srgb,var(--warning)_18%,white)] text-warning dark:bg-[color-mix(in_srgb,var(--warning)_26%,transparent)]",
  leave:
    "bg-[color-mix(in_srgb,var(--primary)_14%,white)] text-primary dark:bg-[color-mix(in_srgb,var(--primary)_24%,transparent)]",
  absent:
    "bg-[color-mix(in_srgb,var(--danger)_14%,white)] text-danger dark:bg-[color-mix(in_srgb,var(--danger)_22%,transparent)]",
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatDays(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function AttendanceCalendar({
  days,
  today,
  presentDays,
  absent,
  leave,
  halfDay,
}: {
  days: { date: string; day: number; status: AttendanceStatus | null }[];
  today: string;
  presentDays: number;
  absent: number;
  leave: number;
  halfDay: number;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; index: number } | null>(null);
  const first = days[0] ? new Date(`${days[0].date}T00:00:00`) : new Date();
  const lead = (first.getDay() + 6) % 7;
  const hovered = tip ? days[tip.index] : null;

  function onMove(event: MouseEvent<HTMLDivElement>, index: number) {
    const card = event.currentTarget.closest("[data-attendance-calendar]") as HTMLElement;
    const bounds = card.getBoundingClientRect();
    setTip({
      index,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  return (
    <div
      data-attendance-calendar
      className="relative rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">This month</p>
        <p className="text-sm font-semibold tabular">{formatDays(presentDays)} present</p>
      </div>
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[4px] bg-[#0b1f3a] px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
          style={{ left: tip!.x, top: Math.max(tip!.y - 8, 28) }}
        >
          {hovered.day} · {hovered.status ? STATUS_LABEL[hovered.status] : "Not marked"}
        </div>
      )}
      <div
        className="grid grid-cols-7 gap-1"
        role="img"
        aria-label={`${formatDays(presentDays)} present days this month`}
        onMouseLeave={() => setTip(null)}
      >
        {WEEKDAYS.map((label) => (
          <div key={label} className="pb-1 text-center text-[10px] font-medium text-muted-foreground">
            {label}
          </div>
        ))}
        {Array.from({ length: lead }, (_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {days.map((day, index) => {
          const isToday = day.date === today;
          const isFuture = day.date > today;
          return (
            <div
              key={day.date}
              className={`flex h-10 items-center justify-center rounded-[4px] text-xs tabular ${
                day.status
                  ? DAY_TONE[day.status]
                  : isFuture
                    ? "text-muted-foreground/45"
                    : "bg-muted text-muted-foreground"
              } ${isToday ? "ring-1 ring-navy" : ""}`}
              onMouseMove={(event) => onMove(event, index)}
            >
              {day.day}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-success" />
          Present {formatDays(presentDays)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-warning" />
          Half day {halfDay}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          Leave {leave}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-danger" />
          Absent {absent}
        </span>
      </div>
    </div>
  );
}

type SliceKey = "paid" | "advance" | "remaining";

const SLICE_COLOR: Record<SliceKey, string> = {
  paid: "var(--color-primary)",
  advance: "var(--color-warning)",
  remaining: "var(--color-base-300)",
};

function piePoint(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: 60 + radius * Math.cos(rad),
    y: 60 + radius * Math.sin(rad),
  };
}

function pieSlice(start: number, end: number) {
  const radius = 52;
  const large = end - start > 180 ? 1 : 0;
  const a = piePoint(start, radius);
  const b = piePoint(end, radius);
  return `M 60 60 L ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export function SalaryPieChart({
  gross,
  paid,
  advance,
  remaining,
}: {
  gross: number;
  paid: number;
  advance: number;
  remaining: number;
}) {
  const [tip, setTip] = useState<{
    key: SliceKey;
    x: number;
    y: number;
  } | null>(null);
  const [hoverKey, setHoverKey] = useState<SliceKey | null>(null);

  const parts: { key: SliceKey; label: string; value: number }[] = [
    { key: "paid", label: "Paid", value: Math.max(0, paid) },
    { key: "advance", label: "Advance", value: Math.max(0, advance) },
    { key: "remaining", label: "Remaining", value: Math.max(0, remaining) },
  ];
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const drawn = parts.filter((part) => part.value > 0);
  const gap = drawn.length > 1 ? 1.8 : 0;
  let cursor = 0;
  const slices = drawn.map((part) => {
    const sweep = total > 0 ? (part.value / total) * 360 : 0;
    const start = cursor + gap / 2;
    const end = Math.max(start + 0.6, cursor + sweep - gap / 2);
    cursor += sweep;
    return { ...part, start, end };
  });

  function onSliceMove(event: MouseEvent<SVGPathElement | SVGCircleElement>, key: SliceKey) {
    const card = event.currentTarget.closest("[data-salary-pie]") as HTMLElement | null;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    setTip({
      key,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  const active = tip?.key ?? hoverKey;
  const activePart = tip ? parts.find((part) => part.key === tip.key) : null;

  return (
    <div
      data-salary-pie
      className="relative rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <p className="text-sm font-medium">Salary split</p>
      {activePart && tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[4px] bg-[#0b1f3a] px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
          style={{ left: tip.x, top: Math.max(tip.y - 8, 28) }}
        >
          {activePart.label} · {formatCurrency(activePart.value)}
        </div>
      )}
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0">
          <svg viewBox="0 0 120 120" className="size-40" role="img" aria-label={`Paid ${formatCurrency(paid)}, advance ${formatCurrency(advance)}, remaining ${formatCurrency(remaining)}`}>
            {total <= 0 && (
              <circle cx="60" cy="60" r="52" fill="var(--color-base-300)" />
            )}
            {drawn.length === 1 && total > 0 && (
              <circle
                cx="60"
                cy="60"
                r="52"
                fill={SLICE_COLOR[drawn[0].key]}
                className={active && active !== drawn[0].key ? "opacity-40" : ""}
                onMouseMove={(event) => onSliceMove(event, drawn[0].key)}
                onMouseLeave={() => setTip(null)}
              />
            )}
            {drawn.length > 1 &&
              slices.map((slice) => (
                <path
                  key={slice.key}
                  d={pieSlice(slice.start, slice.end)}
                  fill={SLICE_COLOR[slice.key]}
                  className={active && active !== slice.key ? "opacity-40" : "transition-opacity"}
                  onMouseMove={(event) => onSliceMove(event, slice.key)}
                  onMouseLeave={() => setTip(null)}
                />
              ))}
          </svg>
          <p className="mt-1 text-center text-sm">
            <span className="font-semibold tabular">{formatCurrency(gross)}</span>
            <span className="ml-1 text-xs uppercase tracking-wide text-muted-foreground">
              gross
            </span>
          </p>
        </div>
        <ul className="grid w-full gap-1 sm:w-56">
          {parts.map((part) => (
            <li
              key={part.key}
              className={`flex items-center justify-between gap-3 rounded-[6px] px-3 py-2 ${active === part.key ? "bg-muted" : ""}`}
              onMouseEnter={() => setHoverKey(part.key)}
              onMouseLeave={() => setHoverKey(null)}
            >
              <span className="inline-flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: SLICE_COLOR[part.key] }}
                />
                {part.label}
              </span>
              <span className="text-sm font-semibold tabular">
                {formatCurrency(part.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
