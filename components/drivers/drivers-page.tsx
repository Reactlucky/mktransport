"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { listDrivers, createDriver, updateDriver } from "@/lib/services/drivers";
import { queryKeys } from "@/lib/query-keys";
import type { Driver, DriverStatusFilter } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  StatusBadge,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { DriverForm } from "@/components/drivers/driver-form";
import { useToast } from "@/components/providers/toast-provider";

export function DriversPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DriverStatusFilter>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const query = useQuery({
    queryKey: queryKeys.drivers.list(search, status),
    queryFn: () => listDrivers(search || undefined, status),
    staleTime: 60_000,
  });

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
      const key = queryKeys.drivers.list(search, status);
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
              className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
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
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as DriverStatusFilter)}
          aria-label="Filter by status"
          className="sm:w-40"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
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
        <>
          <div className="space-y-3 md:hidden">
            {query.data.map((d) => (
              <article
                key={d.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/40"
                onClick={() => router.push(`/dashboard/drivers/${d.id}`)}
              >
                <div>
                  <Link
                    href={`/dashboard/drivers/${d.id}`}
                    className="font-semibold text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {d.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {d.phone || "No phone"}
                    {d.salary > 0 ? ` · ${formatCurrency(d.salary)}` : ""}
                  </p>
                </div>
                <div
                  className="flex flex-col items-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StatusBadge active={d.is_active} />
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: d.id,
                        is_active: !d.is_active,
                      })
                    }
                  >
                    {d.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(d)}
                  >
                    Edit
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Salary</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                    onClick={() => router.push(`/dashboard/drivers/${d.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/dashboard/drivers/${d.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {d.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{d.phone || "—"}</td>
                    <td className="px-4 py-3">{formatCurrency(d.salary)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={d.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="mr-3 text-xs font-medium text-primary hover:underline"
                        onClick={() =>
                          toggleMutation.mutate({
                            id: d.id,
                            is_active: !d.is_active,
                          })
                        }
                      >
                        {d.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => setEditing(d)}
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
