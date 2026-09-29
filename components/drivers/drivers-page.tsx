"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { listDrivers, createDriver, updateDriver } from "@/lib/services/drivers";
import { queryKeys } from "@/lib/query-keys";
import type { Driver } from "@/lib/types";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  StatusBadge,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { DriverForm } from "@/components/drivers/driver-form";
import { useToast } from "@/components/providers/toast-provider";

export function DriversPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const query = useQuery({
    queryKey: queryKeys.drivers.list(search),
    queryFn: () => listDrivers(search || undefined),
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

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Basic driver records. Payroll and attendance come later."
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Driver
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drivers..."
          className="pl-9"
        />
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
          title="No drivers yet"
          description="Add drivers to prepare for future assignments."
          action={
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Add Driver
            </Button>
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
                  </p>
                </div>
                <div
                  className="flex flex-col items-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StatusBadge active={d.is_active} />
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
                    <td className="px-4 py-3">
                      <StatusBadge active={d.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
