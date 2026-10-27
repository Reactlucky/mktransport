"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import {
  listTrucks,
  createTruck,
  updateTruck,
  toggleTruckActive,
} from "@/lib/services/trucks";
import { queryKeys } from "@/lib/query-keys";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Truck, TruckStatus } from "@/lib/types";
import { PageHeader, EmptyState, ErrorState, Refreshing, StatusBadge } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { TruckForm } from "@/components/trucks/truck-form";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";
import { listOpenAssignments } from "@/lib/services/assignments";
import { TruckArt } from "@/components/trucks/truck-art";

const statusLabel: Record<TruckStatus, string> = {
  available: "Available",
  running: "Running",
  maintenance: "Maintenance",
};

const statusClass: Record<TruckStatus, string> = {
  available: "bg-success-muted text-success",
  running: "bg-accent text-accent-foreground",
  maintenance: "bg-warning-muted text-warning",
};

export function TrucksPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Truck | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TruckStatus>("all");

  const query = useQuery({
    queryKey: queryKeys.trucks.list(debouncedSearch),
    queryFn: () => listTrucks(debouncedSearch || undefined),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const openAssignments = useQuery({
    queryKey: ["assignments", "open"],
    queryFn: listOpenAssignments,
    staleTime: 30_000,
    retry: false,
  });

  const driverByTruck = new Map(
    (openAssignments.data ?? []).map((row) => [row.truck_id, row.drivers?.name ?? ""])
  );

  const createMutation = useMutation({
    mutationFn: createTruck,
    onSuccess: async () => {
      toast("Truck added successfully", "success");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTruck>[1] }) =>
      updateTruck(id, data),
    onSuccess: async () => {
      toast("Truck updated", "success");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleTruckActive(id, is_active),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trucks.all });
      const key = queryKeys.trucks.list(debouncedSearch);
      const prev = queryClient.getQueryData<Truck[]>(key);
      queryClient.setQueryData<Truck[]>(key, (old) =>
        old?.map((t) => (t.id === id ? { ...t, is_active } : t))
      );
      return { prev, key };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev);
      toast(e.message, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });

  return (
    <div>
      <PageHeader
        title="Trucks"
        description="Manage your fleet registration and status."
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Truck
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registration or model..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(["all", "running", "available", "maintenance"] as const).map((value) => {
            const active = statusFilter === value;
            const label = value === "all" ? "All" : statusLabel[value];
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                className={cn(
                  "rounded-[6px] border px-3 py-1.5 text-xs font-medium",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Refreshing active={query.isFetching && !query.isLoading} />

      {query.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Unable to load trucks."
          }
          onRetry={() => query.refetch()}
        />
      )}

      {query.isSuccess && query.data.length === 0 && (
        <EmptyState
          title="No trucks yet"
          description="Add your first truck to start recording trips."
          action={
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Add Truck
            </Button>
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <TruckGrid
          trucks={
            statusFilter === "all"
              ? query.data
              : query.data.filter((truck) => truck.status === statusFilter)
          }
          counts={{
            total: query.data.length,
            running: query.data.filter((truck) => truck.status === "running").length,
            available: query.data.filter((truck) => truck.status === "available").length,
            maintenance: query.data.filter((truck) => truck.status === "maintenance").length,
          }}
          driverByTruck={driverByTruck}
          onOpen={(id) => router.push(`/dashboard/trucks/${id}`)}
          onEdit={setEditing}
          onToggle={(id, is_active) => toggleMutation.mutate({ id, is_active })}
        />
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add Truck"
        fullScreenMobile
      >
        <TruckForm
          submitLabel="Add Truck"
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
        />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Truck"
        fullScreenMobile
      >
        {editing && (
          <TruckForm
            initial={editing}
            submitLabel="Update Truck"
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({ id: editing.id, data });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function TruckGrid({
  trucks,
  counts,
  driverByTruck,
  onOpen,
  onEdit,
  onToggle,
}: {
  trucks: Truck[];
  counts: { total: number; running: number; available: number; maintenance: number };
  driverByTruck: Map<string, string>;
  onOpen: (id: string) => void;
  onEdit: (truck: Truck) => void;
  onToggle: (id: string, isActive: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular">{counts.total}</span> total
        </span>
        <span>
          <span className="font-semibold text-accent-foreground tabular">{counts.running}</span> running
        </span>
        <span>
          <span className="font-semibold text-success tabular">{counts.available}</span> available
        </span>
        <span>
          <span className="font-semibold text-warning tabular">{counts.maintenance}</span> maintenance
        </span>
      </p>
      {trucks.length === 0 ? (
        <p className="rounded-[10px] border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No trucks with this status.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.map((truck) => {
            const driver = driverByTruck.get(truck.id);
            return (
              <article
                key={truck.id}
                className="flex cursor-pointer flex-col rounded-[10px] border border-border bg-card shadow-[var(--shadow-card)] hover:bg-muted/40"
                onClick={() => onOpen(truck.id)}
              >
                <div className="flex items-start justify-between gap-3 px-4 pt-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{truck.model || "Truck"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {truck.registration_number}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-[6px] px-2.5 py-0.5 text-xs font-medium",
                      statusClass[truck.status]
                    )}
                  >
                    {statusLabel[truck.status]}
                  </span>
                </div>
                <TruckArt className="mx-auto w-[78%] py-1" />
                <div className="flex items-center justify-between gap-3 px-4">
                  <p className="truncate text-sm text-muted-foreground">
                    {driver || "No driver"}
                  </p>
                  {!truck.is_active && <StatusBadge active={false} />}
                </div>
                <div
                  className="mt-3 flex gap-3 border-t border-border px-4 py-3"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => onEdit(truck)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => onToggle(truck.id, !truck.is_active)}
                  >
                    {truck.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
