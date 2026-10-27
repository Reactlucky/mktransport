"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { listDrivers, createDriver, updateDriver } from "@/lib/services/drivers";
import { queryKeys } from "@/lib/query-keys";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Driver, DriverStatusFilter } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  Refreshing,
  StatusBadge,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { DriverForm } from "@/components/drivers/driver-form";
import { useToast } from "@/components/providers/toast-provider";
import { listOpenAssignments } from "@/lib/services/assignments";

const tileTints = [
  "bg-accent text-accent-foreground",
  "bg-success-muted text-success",
  "bg-warning-muted text-warning",
  "bg-primary/15 text-primary",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function tileTint(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tileTints[hash % tileTints.length];
}

export function DriversPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<DriverStatusFilter>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const query = useQuery({
    queryKey: queryKeys.drivers.list(debouncedSearch, status),
    queryFn: () => listDrivers(debouncedSearch || undefined, status),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const openAssignments = useQuery({
    queryKey: ["assignments", "open"],
    queryFn: listOpenAssignments,
    staleTime: 30_000,
    retry: false,
  });

  const truckByDriver = new Map(
    (openAssignments.data ?? []).map((row) => [
      row.driver_id,
      row.trucks?.registration_number ?? "",
    ])
  );

  const createMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: async () => {
      toast("Driver added successfully", "success");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateDriver>[1];
    }) => updateDriver(id, data),
    onSuccess: async () => {
      toast("Driver updated", "success");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateDriver(id, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.drivers.all });
      const key = queryKeys.drivers.list(debouncedSearch, status);
      const prev = queryClient.getQueryData<Driver[]>(key);
      queryClient.setQueryData<Driver[]>(key, (old) =>
        old?.map((d) => (d.id === id ? { ...d, is_active } : d))
      );
      return { prev, key };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev);
      toast(e.message, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
  });

  const filtering = search.trim().length > 0 || status !== "all";

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="People who drive the trucks."
        action={
          <div className="flex gap-2">
            <Link
              href="/dashboard/salary"
              className="inline-flex h-11 items-center rounded-[3px] border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              Salaries
            </Link>
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Add Driver
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["inactive", "Inactive"],
            ] as const
          ).map(([value, label]) => {
            const active = status === value;
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
                onClick={() => setStatus(value)}
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
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Unable to load drivers."
          }
          onRetry={() => query.refetch()}
        />
      )}

      {query.isSuccess && query.data.length === 0 && (
        <EmptyState
          title={filtering ? "No drivers match" : "No drivers yet"}
          description={
            filtering
              ? "Try a different name, phone, or status."
              : "Add a driver to assign them to a truck."
          }
          action={
            filtering ? undefined : (
              <Button type="button" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Add Driver
              </Button>
            )
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <DriverGrid
          drivers={query.data}
          truckByDriver={truckByDriver}
          onOpen={(id) => router.push(`/dashboard/drivers/${id}`)}
          onEdit={setEditing}
          onToggle={(id, is_active) => toggleMutation.mutate({ id, is_active })}
        />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add Driver" fullScreenMobile>
        <DriverForm
          submitLabel="Add Driver"
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
        />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Driver"
        fullScreenMobile
      >
        {editing && (
          <DriverForm
            initial={editing}
            submitLabel="Update Driver"
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({ id: editing.id, data });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function DriverGrid({
  drivers,
  truckByDriver,
  onOpen,
  onEdit,
  onToggle,
}: {
  drivers: Driver[];
  truckByDriver: Map<string, string>;
  onOpen: (id: string) => void;
  onEdit: (driver: Driver) => void;
  onToggle: (id: string, isActive: boolean) => void;
}) {
  const active = drivers.filter((driver) => driver.is_active).length;

  return (
    <div>
      <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular">{drivers.length}</span> total
        </span>
        <span>
          <span className="font-semibold text-success tabular">{active}</span> active
        </span>
        <span>
          <span className="font-semibold text-muted-foreground tabular">
            {drivers.length - active}
          </span>{" "}
          inactive
        </span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => {
          const truck = truckByDriver.get(driver.id);
          return (
            <article
              key={driver.id}
              className="flex cursor-pointer flex-col rounded-[10px] border border-border bg-card shadow-[var(--shadow-card)] hover:bg-muted/40"
              onClick={() => onOpen(driver.id)}
            >
              <div className="flex items-start justify-between gap-3 px-4 pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-[8px] font-display text-sm font-semibold",
                      tileTint(driver.name)
                    )}
                  >
                    {initials(driver.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{driver.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {truck || "No truck"}
                    </p>
                  </div>
                </div>
                <StatusBadge active={driver.is_active} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 px-4 pb-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 text-sm">{driver.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Salary</dt>
                  <dd className="mt-0.5 text-sm">{formatCurrency(driver.salary)}</dd>
                </div>
              </dl>
              <div
                className="mt-auto flex gap-3 border-t border-border px-4 py-3"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => onEdit(driver)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => onToggle(driver.id, !driver.is_active)}
                >
                  {driver.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
