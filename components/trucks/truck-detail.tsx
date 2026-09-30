"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getTruck, getTruckTrips, countTruckTripsThisMonth, updateTruck } from "@/lib/services/trucks";
import { queryKeys } from "@/lib/query-keys";
import type { TruckStatus } from "@/lib/types";
import {
  PageHeader,
  ErrorState,
  InlineLoading,
  StatusBadge,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { TruckForm } from "@/components/trucks/truck-form";
import { RelatedTrips } from "@/components/trips/related-trips";
import { AssignmentHistory } from "@/components/drivers/assignment-history";
import { useToast } from "@/components/providers/toast-provider";
import { cn, formatDate } from "@/lib/utils";
import { vehicleAge } from "@/lib/calculations/papers";

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

export function TruckDetailPage({ id }: { id: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const truckQuery = useQuery({
    queryKey: queryKeys.trucks.detail(id),
    queryFn: () => getTruck(id),
  });

  const tripsQuery = useQuery({
    queryKey: queryKeys.trucks.trips(id),
    queryFn: () => getTruckTrips(id),
    enabled: truckQuery.isSuccess,
  });

  const monthTrips = useQuery({
    queryKey: queryKeys.trucks.monthTrips(id),
    queryFn: () => countTruckTripsThisMonth(id),
    enabled: truckQuery.isSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateTruck>[1]) =>
      updateTruck(id, data),
    onSuccess: async () => {
      toast("Truck updated", "success");
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  if (truckQuery.isLoading) {
    return <InlineLoading label="Loading truck..." />;
  }

  if (truckQuery.isError || !truckQuery.data) {
    return (
      <ErrorState
        message={
          truckQuery.error instanceof Error
            ? truckQuery.error.message
            : "Unable to load truck details."
        }
        onRetry={() => truckQuery.refetch()}
      />
    );
  }

  const truck = truckQuery.data;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/trucks"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Trucks
      </Link>

      <PageHeader
        title={truck.registration_number}
        description={truck.model || "No model"}
        action={
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Registration</p>
            <p className="mt-0.5 text-sm font-medium">{truck.registration_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Model</p>
            <p className="mt-0.5 text-sm font-medium">{truck.model || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusClass[truck.status]
                )}
              >
                {statusLabel[truck.status]}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1">
              <StatusBadge active={truck.is_active} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trips this month</p>
            <p className="mt-0.5 font-display text-lg font-semibold tabular">
              {monthTrips.isLoading ? "…" : monthTrips.data ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Vehicle age</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.registration_date ? vehicleAge(truck.registration_date) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registration date</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.registration_date ? formatDate(truck.registration_date) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fitness valid up to</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.fitness_valid_until ? formatDate(truck.fitness_valid_until) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tax valid up to</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.tax_is_lifetime
                ? "LTT"
                : truck.tax_valid_until
                  ? formatDate(truck.tax_valid_until)
                  : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Insurance valid up to</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.insurance_valid_until ? formatDate(truck.insurance_valid_until) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">PUCC valid up to</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.pucc_valid_until ? formatDate(truck.pucc_valid_until) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EMI date</p>
            <p className="mt-0.5 text-sm font-medium">
              {truck.emi_due_on ? formatDate(truck.emi_due_on) : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <AssignmentHistory truckId={truck.id} />

      <div className="mt-6">
      <RelatedTrips
        trips={tripsQuery.data}
        isLoading={tripsQuery.isLoading}
        isError={tripsQuery.isError}
        onRetry={() => tripsQuery.refetch()}
        secondaryLabel="Customer"
        secondary={(trip) => trip.customers?.name ?? "—"}
      />
      </div>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit Truck"
        fullScreenMobile
      >
        <TruckForm
          initial={truck}
          submitLabel="Update Truck"
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
        />
      </Dialog>
    </div>
  );
}
