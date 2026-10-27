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
    { label: "Fleet", value: fleet?.total ?? 0 },
    { label: "Running", value: fleet?.running ?? 0 },
    { label: "Available", value: fleet?.available ?? 0 },
    { label: "Maintenance", value: fleet?.maintenance ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-4 border-b border-base-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-base-content/60">{dateLabel}</p>
          <h2 className="mt-1 font-display text-4xl font-medium leading-none">{greeting}</h2>
          <p className="mt-3 text-sm text-base-content/70">
            {fleet
              ? `${fleet.total} trucks · ${fleet.running} running · ${fleet.available} available`
              : "Loading the fleet"}
          </p>
        </div>
        <Link href="/dashboard/trips/new" className="btn btn-primary">
          <Plus className="size-4" />
          Add trip
        </Link>
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
          <div className="fleet-stats stats w-full grid-cols-2 border border-base-300 bg-base-100 shadow-none md:grid-cols-3 xl:grid-cols-6">
            {kpis.map((stat) => (
              <div key={stat.label} className="stat">
                <div className="stat-title">{stat.label}</div>
                <div className="stat-value text-3xl tabular">{stat.value}</div>
              </div>
            ))}
            <div className="stat">
              <div className="stat-title">Trips this month</div>
              {monthly.isLoading ? (
                <Skeleton className="mt-2 h-9 w-16" />
              ) : monthly.isError ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-error"
                  onClick={() => monthly.refetch()}
                >
                  Retry
                </button>
              ) : (
                <div className="stat-value text-3xl tabular">
                  {monthly.data?.trip_count ?? "—"}
                </div>
              )}
            </div>
            <div className="stat">
              <div className="stat-title">Rent this month</div>
              {monthly.isLoading ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : monthly.isError ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-error"
                  onClick={() => monthly.refetch()}
                >
                  Retry
                </button>
              ) : (
                <div className="stat-value text-2xl tabular text-primary">
                  {monthly.data ? formatCurrency(monthly.data.total_rent) : "—"}
                </div>
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

      <section aria-label="Quick actions" className="flex flex-wrap gap-2">
        <Link href="/dashboard/trucks" className="btn btn-outline btn-sm">
          Trucks
        </Link>
        <Link href="/dashboard/customers" className="btn btn-outline btn-sm">
          Customers
        </Link>
        <Link href="/dashboard/drivers" className="btn btn-outline btn-sm">
          Drivers
        </Link>
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
                    className="flex h-full items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3.5"
                  >
                    <span className="min-w-0">
                      <span
                        className={
                          overdue
                            ? "badge badge-soft badge-error"
                            : "badge badge-soft badge-warning"
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
