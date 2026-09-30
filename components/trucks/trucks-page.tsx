"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import {
  listTrucks,
  createTruck,
  updateTruck,
  toggleTruckActive,
} from "@/lib/services/trucks";
import { queryKeys } from "@/lib/query-keys";
import type { Truck, TruckStatus } from "@/lib/types";
import { PageHeader, EmptyState, ErrorState, StatusBadge } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { TruckForm } from "@/components/trucks/truck-form";
import { useToast } from "@/components/providers/toast-provider";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { listOpenAssignments } from "@/lib/services/assignments";

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Truck | null>(null);

  const query = useQuery({
    queryKey: queryKeys.trucks.list(search),
    queryFn: () => listTrucks(search || undefined),
    staleTime: 60_000,
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
      const key = queryKeys.trucks.list(search);
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TruckStatus }) =>
      updateTruck(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trucks.all });
      const key = queryKeys.trucks.list(search);
      const prev = queryClient.getQueryData<Truck[]>(key);
      queryClient.setQueryData<Truck[]>(key, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t))
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

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registration or model..."
          className="pl-9"
        />
      </div>

      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
        <>
          <div className="space-y-3 md:hidden">
            {query.data.map((truck) => (
              <article
                key={truck.id}
                className="cursor-pointer rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] p-4 hover:bg-muted/40"
                onClick={() => router.push(`/dashboard/trucks/${truck.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/trucks/${truck.id}`}
                      className="font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {truck.registration_number}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {truck.model || "No model"}
                      {driverByTruck.get(truck.id)
                        ? ` · ${driverByTruck.get(truck.id)}`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge active={truck.is_active} />
                </div>
                <div
                  className="mt-3 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Select
                    value={truck.status}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: truck.id,
                        status: e.target.value as TruckStatus,
                      })
                    }
                    className="h-9 flex-1 text-sm"
                    aria-label={`Status for ${truck.registration_number}`}
                  >
                    {(Object.keys(statusLabel) as TruckStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(truck)}
                  >
                    Edit
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Registration</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((truck) => (
                  <tr
                    key={truck.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                    onClick={() => router.push(`/dashboard/trucks/${truck.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/dashboard/trucks/${truck.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {truck.registration_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p>{truck.model || "—"}</p>
                      {driverByTruck.get(truck.id) && (
                        <p className="text-xs text-muted-foreground">
                          {driverByTruck.get(truck.id)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusClass[truck.status]
                        )}
                      >
                        {statusLabel[truck.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() =>
                          toggleMutation.mutate({
                            id: truck.id,
                            is_active: !truck.is_active,
                          })
                        }
                      >
                        {truck.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => setEditing(truck)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
