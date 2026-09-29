"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  getMonthlyTripSummary,
  getTruckStatusSummary,
} from "@/lib/services/dashboard";
import { getRecentTrips, getTodayTrips } from "@/lib/services/trips";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/ui/states";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MaintenanceIcon,
  RouteIcon,
  TruckIcon,
} from "@/components/icons/transport";
import { TripCard } from "@/components/trips/trip-card";

export function DashboardPageClient() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const truckSummary = useQuery({
    queryKey: queryKeys.dashboard.truckSummary,
    queryFn: getTruckStatusSummary,
    staleTime: 30_000,
  });

  const monthly = useQuery({
    queryKey: queryKeys.dashboard.monthly,
    queryFn: () => getMonthlyTripSummary(year, month),
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

  const truckStats = [
    {
      label: "Total",
      value: truckSummary.data?.total ?? 0,
      icon: TruckIcon,
    },
    {
      label: "Running",
      value: truckSummary.data?.running ?? 0,
      icon: RouteIcon,
    },
    {
      label: "Available",
      value: truckSummary.data?.available ?? 0,
      icon: TruckIcon,
    },
    {
      label: "Maintenance",
      value: truckSummary.data?.maintenance ?? 0,
      icon: MaintenanceIcon,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="What is happening with your business today?"
        action={
          <Link
            href="/dashboard/trips/new"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="size-4" />
            Add Trip
          </Link>
        }
      />

      {/* Truck summary */}
      <section className="mb-6" aria-labelledby="truck-summary-heading">
        <h2
          id="truck-summary-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Truck summary
        </h2>
        {truckSummary.isLoading && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}
        {truckSummary.isError && (
          <ErrorState
            message="Unable to load truck summary."
            onRetry={() => truckSummary.refetch()}
          />
        )}
        {truckSummary.isSuccess && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {truckStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-2xl font-semibold tabular-nums">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Monthly overview */}
      <section className="mb-6" aria-labelledby="monthly-heading">
        <h2
          id="monthly-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          This month
        </h2>
        {monthly.isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
        {monthly.isSuccess && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Trips this month</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                  {monthly.data.trip_count}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Total rent</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-primary">
                  {formatCurrency(monthly.data.total_rent)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Today's trips */}
      <section className="mb-6" aria-labelledby="today-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="today-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Today&apos;s trips
          </h2>
          <Link
            href="/dashboard/trips"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {todayTrips.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
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
            action={
              <Link
                href="/dashboard/trips/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                <Plus className="size-4" />
                Add Trip
              </Link>
            }
          />
        )}
        {todayTrips.isSuccess && todayTrips.data.length > 0 && (
          <>
            <div className="space-y-3 md:hidden">
              {todayTrips.data.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
            <Card className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Truck</th>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium text-right">Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayTrips.data.map((trip) => (
                      <tr
                        key={trip.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/dashboard/trucks/${trip.truck_id}`}
                            className="text-primary hover:underline"
                          >
                            {trip.trucks?.registration_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {trip.from_location} → {trip.to_location}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/customers/${trip.customer_id}`}
                            className="text-primary hover:underline"
                          >
                            {trip.customers?.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(trip.rent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </section>

      {/* Recent trips */}
      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Recent trips
        </h2>
        {recentTrips.isLoading && <Skeleton className="h-40" />}
        {recentTrips.isSuccess && recentTrips.data.length > 0 && (
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">
                Latest activity across the fleet
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recentTrips.data.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      <Link
                        href={`/dashboard/trucks/${trip.truck_id}`}
                        className="text-primary hover:underline"
                      >
                        {trip.trucks?.registration_number}
                      </Link>{" "}
                      · {trip.from_location} → {trip.to_location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(trip.trip_date)} ·{" "}
                      <Link
                        href={`/dashboard/customers/${trip.customer_id}`}
                        className="hover:underline"
                      >
                        {trip.customers?.name}
                      </Link>
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatCurrency(trip.rent)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
