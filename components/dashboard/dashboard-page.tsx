"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getMonthlyTripSummary } from "@/lib/services/dashboard";
import { getRecentTrips, getTodayTrips, listTripRentsForMonth } from "@/lib/services/trips";
import { listTrucks } from "@/lib/services/trucks";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDate, toInputDate } from "@/lib/utils";
import { dailyRentTotals } from "@/lib/calculations/charts";
import { summarizeActiveTrucks } from "@/lib/calculations/fleet";
import { reminderLabel, upcomingPaperReminders } from "@/lib/calculations/papers";
import { EmptyState, ErrorState, Refreshing } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyRentChart } from "@/components/charts/amount-charts";
import { TripCard } from "@/components/trips/trip-card";

type DashboardClock = {
  year: number;
  month: number;
  greeting: string;
  dateLabel: string;
};

let cachedClock: DashboardClock | null = null;

function readClock(): DashboardClock {
  if (cachedClock) return cachedClock;
  const now = new Date();
  const hour = now.getHours();
  cachedClock = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    greeting:
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
    dateLabel: now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  };
  return cachedClock;
}

export function DashboardPageClient() {
  const clock = useSyncExternalStore(
    () => () => {},
    readClock,
    () => null
  );

  const year = clock?.year ?? 0;
  const month = clock?.month ?? 0;

  const trucksQuery = useQuery({
    queryKey: queryKeys.trucks.list(""),
    queryFn: () => listTrucks(),
    staleTime: 60_000,
  });

  const monthly = useQuery({
    queryKey: queryKeys.dashboard.monthly(year, month),
    queryFn: () => getMonthlyTripSummary(year, month),
    enabled: clock != null,
    staleTime: 30_000,
  });

  const dailyRents = useQuery({
    queryKey: queryKeys.dashboard.daily(year, month),
    queryFn: () => listTripRentsForMonth(year, month),
    enabled: clock != null,
    staleTime: 30_000,
  });

  const todayTrips = useQuery({
    queryKey: queryKeys.trips.today,
    queryFn: getTodayTrips,
    staleTime: 15_000,
  });

  const recentTrips = useQuery({
    queryKey: queryKeys.trips.recent,
    queryFn: () => getRecentTrips(5),
    staleTime: 15_000,
  });

  const fleet = trucksQuery.data
    ? summarizeActiveTrucks(trucksQuery.data)
    : undefined;
  const dueReminders = trucksQuery.data
    ? upcomingPaperReminders(trucksQuery.data)
    : [];

  const greeting = clock?.greeting ?? "Today";
  const dateLabel = clock?.dateLabel ?? "";

  const kpis = [
    { label: "Fleet", value: fleet?.total ?? 0, tone: "bg-[#0B1F3A] text-white" },
    { label: "Running", value: fleet?.running ?? 0, tone: "bg-accent text-accent-foreground" },
    { label: "Available", value: fleet?.available ?? 0, tone: "bg-success-muted text-success" },
    { label: "Maintenance", value: fleet?.maintenance ?? 0, tone: "bg-warning-muted text-warning" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-[14px] border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">
              {greeting}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {fleet
                ? `${fleet.total} trucks · ${fleet.running} running · ${fleet.available} available`
                : "Loading the fleet"}
            </p>
          </div>
          <Link
            href="/dashboard/trips/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] bg-gradient-to-br from-[#2563eb] to-[#60a5fa] px-5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
          >
            <Plus className="size-4" />
            Add Trip
          </Link>
        </div>
        <svg
          className="pointer-events-none absolute -right-6 bottom-0 h-28 w-72 text-primary/30"
          viewBox="0 0 280 80"
          fill="none"
          aria-hidden
        >
          <path
            d="M8 62 C 70 62, 80 18, 140 18 S 210 62, 272 28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="8" cy="62" r="5" fill="currentColor" />
          <circle cx="272" cy="28" r="5" fill="currentColor" />
        </svg>
      </section>

      <section aria-label="Fleet and month">
        <Refreshing active={trucksQuery.isFetching && !trucksQuery.isLoading} />
        {trucksQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        )}
        {trucksQuery.isError && (
          <ErrorState
            message="Unable to load truck summary."
            onRetry={() => trucksQuery.refetch()}
          />
        )}
        {trucksQuery.isSuccess && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            {kpis.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-[10px] p-4 shadow-[var(--shadow-soft)] ${stat.tone}`}
              >
                <p className="text-xs font-medium opacity-80">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold tabular">{stat.value}</p>
              </div>
            ))}
            <div className="rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-medium text-muted-foreground">Trips this month</p>
              {monthly.isLoading ? (
                <Skeleton className="mt-2 h-9 w-16" />
              ) : monthly.isError ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-danger"
                  onClick={() => monthly.refetch()}
                >
                  Retry
                </button>
              ) : (
                <p className="mt-2 font-display text-3xl font-semibold tabular">
                  {monthly.data?.trip_count ?? "—"}
                </p>
              )}
            </div>
            <div className="rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-medium text-muted-foreground">Rent this month</p>
              {monthly.isLoading ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : monthly.isError ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-danger"
                  onClick={() => monthly.refetch()}
                >
                  Retry
                </button>
              ) : (
                <p className="mt-2 font-display text-2xl font-semibold tabular text-primary">
                  {monthly.data ? formatCurrency(monthly.data.total_rent) : "—"}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <section aria-label="Daily rent">
        {dailyRents.isLoading && <Skeleton className="h-48" />}
        {dailyRents.isError && (
          <ErrorState
            message="Unable to load daily rent."
            onRetry={() => dailyRents.refetch()}
          />
        )}
        {dailyRents.isSuccess && clock && (
          <DailyRentChart
            days={dailyRentTotals(dailyRents.data, clock.year, clock.month)}
            today={toInputDate()}
          />
        )}
      </section>

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/dashboard/trips/new", label: "Add Trip" },
          { href: "/dashboard/trucks", label: "Add Truck" },
          { href: "/dashboard/customers", label: "Add Customer" },
          { href: "/dashboard/drivers", label: "Add Driver" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-[10px] border border-border bg-card px-4 py-4 text-sm font-medium shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5"
          >
            {action.label}
          </Link>
        ))}
      </section>

      <section aria-labelledby="reminders-heading">
        <h2 id="reminders-heading" className="font-display text-lg font-semibold">
          Reminders
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Fitness, insurance, and EMI dates that need attention.
        </p>
        {trucksQuery.isLoading && <Skeleton className="h-24" />}
        {trucksQuery.isSuccess && dueReminders.length === 0 && (
          <EmptyState
            title="Nothing due soon"
            description="EMI, fitness, and insurance dates in the next 30 days show up here."
          />
        )}
        {trucksQuery.isSuccess && dueReminders.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {dueReminders.map((item) => {
              const overdue = item.daysUntil <= 0;
              const kind =
                item.kind === "emi"
                  ? "EMI"
                  : item.kind === "fitness"
                    ? "Fitness"
                    : "Insurance";
              return (
                <li key={`${item.truckId}-${item.kind}`}>
                  <Link
                    href={`/dashboard/trucks/${item.truckId}`}
                    className={
                      overdue
                        ? "flex h-full items-center justify-between gap-3 rounded-[10px] border border-danger/20 bg-[color-mix(in_srgb,var(--danger)_10%,white)] px-4 py-3.5 dark:bg-[color-mix(in_srgb,var(--danger)_16%,transparent)]"
                        : "flex h-full items-center justify-between gap-3 rounded-[10px] border border-warning/25 bg-[color-mix(in_srgb,var(--warning)_12%,white)] px-4 py-3.5 dark:bg-[color-mix(in_srgb,var(--warning)_18%,transparent)]"
                    }
                  >
                    <span className="min-w-0">
                      <span
                        className={
                          overdue
                            ? "inline-flex rounded-[6px] bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger"
                            : "inline-flex rounded-[6px] bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning"
                        }
                      >
                        {kind}
                      </span>
                      <span className="mt-1.5 block truncate text-sm font-semibold text-navy">
                        {item.registration}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </span>
                    </span>
                    <span
                      className={
                        overdue
                          ? "shrink-0 text-right text-sm font-semibold text-danger"
                          : "shrink-0 text-right text-sm font-semibold text-warning"
                      }
                    >
                      {reminderLabel(item.daysUntil)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="today-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="today-heading" className="font-display text-lg font-semibold">
            Today&apos;s trips
          </h2>
          <Link href="/dashboard/trips" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {todayTrips.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
        {todayTrips.isError && (
          <ErrorState
            message="Unable to load today's trips."
            onRetry={() => todayTrips.refetch()}
          />
        )}
        {todayTrips.isSuccess && todayTrips.data.length === 0 && (
          <EmptyState
            title="No trips today"
            description="Add a trip to start tracking today's work."
          />
        )}
        {todayTrips.isSuccess && todayTrips.data.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {todayTrips.data.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="mb-3 font-display text-lg font-semibold">
          Recent trips
        </h2>
        {recentTrips.isLoading && <Skeleton className="h-40" />}
        {recentTrips.isError && (
          <ErrorState
            message="Unable to load recent trips."
            onRetry={() => recentTrips.refetch()}
          />
        )}
        {recentTrips.isSuccess && recentTrips.data.length > 0 && (
          <div className="space-y-3">
            {recentTrips.data.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
