"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { listTrips, deleteTrip } from "@/lib/services/trips";
import { listActiveTrucks } from "@/lib/services/trucks";
import { listActiveCustomers } from "@/lib/services/customers";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/trips/trip-card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/toast-provider";
import { Label } from "@/components/ui/label";

export function TripsPageClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [truckId, setTruckId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      truckId: truckId || undefined,
      customerId: customerId || undefined,
      page,
      pageSize: 25,
    }),
    [debouncedSearch, dateFrom, dateTo, truckId, customerId, page]
  );

  const tripsQuery = useQuery({
    queryKey: queryKeys.trips.list(filters),
    queryFn: () => listTrips(filters),
    staleTime: 15_000,
  });

  const trucksQuery = useQuery({
    queryKey: queryKeys.trucks.active,
    queryFn: () => listActiveTrucks(),
    staleTime: 60_000,
  });

  const customersQuery = useQuery({
    queryKey: queryKeys.customers.active,
    queryFn: () => listActiveCustomers(),
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: async () => {
      toast("Trip deleted", "success");
      setDeleteId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]);
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const total = tripsQuery.data?.count ?? 0;
  const pageSize = 25;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filterSummary =
    [dateFrom, dateTo, truckId, customerId].filter(Boolean).length > 0;

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setTruckId("");
    setCustomerId("");
    setPage(1);
  }

  const filterFields = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label htmlFor="dateFrom">From date</Label>
        <Input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div>
        <Label htmlFor="dateTo">To date</Label>
        <Input
          id="dateTo"
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div>
        <Label htmlFor="truckFilter">Truck</Label>
        <Select
          id="truckFilter"
          value={truckId}
          onChange={(e) => {
            setTruckId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All trucks</option>
          {(trucksQuery.data ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.registration_number}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="customerFilter">Customer</Label>
        <Select
          id="customerFilter"
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All customers</option>
          {(customersQuery.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Daily trip records for your fleet."
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

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search route..."
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="lg:hidden"
          onClick={() => setFiltersOpen(true)}
          aria-label="Filters"
        >
          <Filter className="size-4" />
          {filterSummary && (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      <div className="mb-4 hidden rounded-lg border border-border bg-card p-4 lg:block">
        {filterFields}
        {filterSummary && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>

      {tripsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full md:h-14" />
          ))}
        </div>
      )}

      {tripsQuery.isError && (
        <ErrorState
          message={
            tripsQuery.error instanceof Error
              ? tripsQuery.error.message
              : "Unable to load trips."
          }
          onRetry={() => tripsQuery.refetch()}
        />
      )}

      {tripsQuery.isSuccess && tripsQuery.data.data.length === 0 && (
        <EmptyState
          title="No trips found"
          description="Record your first trip to replace the notebook."
          action={
            <Link
              href="/dashboard/trips/new"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" />
              Add Trip
            </Link>
          }
        />
      )}

      {tripsQuery.isSuccess && tripsQuery.data.data.length > 0 && (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {tripsQuery.data.data.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={() => setDeleteId(trip.id)}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Truck</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium text-right">Rent</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tripsQuery.data.data.map((trip) => (
                    <tr
                      key={trip.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(trip.trip_date)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/dashboard/trucks/${trip.truck_id}`}
                          className="text-primary hover:underline"
                        >
                          {trip.trucks?.registration_number ?? "—"}
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
                          {trip.customers?.name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(trip.rent)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/dashboard/trips/${trip.id}/edit`}
                            className="rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="rounded-md px-2 py-1.5 text-xs font-medium text-danger hover:bg-danger-muted"
                            onClick={() => setDeleteId(trip.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing {from}–{to} of {total} trips
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        fullScreenMobile
      >
        {filterFields}
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={clearFilters}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => setFiltersOpen(false)}
          >
            Apply
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete trip?"
        description="This trip will be permanently removed. This cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
