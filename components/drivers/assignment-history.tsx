"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endAssignment, listAssignments } from "@/lib/services/assignments";
import { queryKeys } from "@/lib/query-keys";
import { formatDate, toInputDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { AssignDialog } from "@/components/drivers/assign-dialog";
import { useToast } from "@/components/providers/toast-provider";

export function AssignmentHistory({
  truckId,
  driverId,
}: {
  truckId?: string;
  driverId?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: truckId
      ? queryKeys.trucks.assignments(truckId)
      : queryKeys.drivers.assignments(driverId ?? ""),
    queryFn: () => listAssignments({ truckId, driverId }),
    enabled: Boolean(truckId || driverId),
  });

  const endMutation = useMutation({
    mutationFn: (row: { id: string; started_on: string }) => {
      const today = toInputDate();
      const endedOn = row.started_on > today ? row.started_on : today;
      return endAssignment(row.id, endedOn);
    },
    onSuccess: async () => {
      toast("Assignment ended", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all }),
      ]);
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const current = query.data?.find((row) => !row.ended_on) ?? null;
  const history = query.data?.filter((row) => row.ended_on) ?? [];

  return (
    <section className="mt-6" aria-labelledby="assignment-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="assignment-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Assignment
        </h2>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          {current ? "Change" : "Assign"}
        </Button>
      </div>

      {query.isLoading && <Skeleton className="h-20 w-full" />}
      {query.isError && (
        <ErrorState
          message="Unable to load assignments."
          onRetry={() => query.refetch()}
        />
      )}

      {query.isSuccess && !current && (
        <p className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-4 py-6 text-sm text-muted-foreground">
          {truckId
            ? "No driver is assigned to this truck."
            : "This driver is not assigned to a truck."}
        </p>
      )}

      {current && (
        <div className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-4 py-4">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="mt-1 text-sm font-medium">
            {truckId ? (
              <Link
                href={`/dashboard/drivers/${current.driver_id}`}
                className="text-primary hover:underline"
              >
                {current.drivers?.name ?? "Driver"}
              </Link>
            ) : (
              <Link
                href={`/dashboard/trucks/${current.truck_id}`}
                className="text-primary hover:underline"
              >
                {current.trucks?.registration_number ?? "Truck"}
              </Link>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Since {formatDate(current.started_on)}
          </p>
          <button
            type="button"
            className="mt-3 text-xs font-medium text-primary hover:underline"
            onClick={() => endMutation.mutate(current)}
            disabled={endMutation.isPending}
          >
            {endMutation.isPending ? "Ending..." : "End assignment"}
          </button>
        </div>
      )}

      {history.length > 0 && (
        <ul className="mt-3 space-y-2">
          {history.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-border px-4 py-3 text-sm"
            >
              <p className="font-medium">
                {truckId
                  ? row.drivers?.name ?? "Driver"
                  : row.trucks?.registration_number ?? "Truck"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(row.started_on)}
                {row.ended_on ? ` – ${formatDate(row.ended_on)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <AssignDialog
        open={open}
        onClose={() => setOpen(false)}
        truckId={truckId}
        driverId={driverId}
      />
    </section>
  );
}
