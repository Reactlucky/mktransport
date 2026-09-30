"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { countDriverTripsThisMonth, getDriver, updateDriver } from "@/lib/services/drivers";
import { queryKeys } from "@/lib/query-keys";
import {
  PageHeader,
  ErrorState,
  InlineLoading,
  StatusBadge,
} from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DriverForm } from "@/components/drivers/driver-form";
import { AssignmentHistory } from "@/components/drivers/assignment-history";
import { DriverAttendanceSummary } from "@/components/drivers/driver-attendance-summary";
import { DriverSalarySection } from "@/components/drivers/driver-salary";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DriverDetailPage({ id }: { id: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const driverQuery = useQuery({
    queryKey: queryKeys.drivers.detail(id),
    queryFn: () => getDriver(id),
  });

  const monthTrips = useQuery({
    queryKey: queryKeys.drivers.monthTrips(id),
    queryFn: () => countDriverTripsThisMonth(id),
    enabled: driverQuery.isSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateDriver>[1]) =>
      updateDriver(id, data),
    onSuccess: async () => {
      toast("Driver updated", "success");
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  if (driverQuery.isLoading) {
    return <InlineLoading label="Loading driver..." />;
  }

  if (driverQuery.isError || !driverQuery.data) {
    return (
      <ErrorState
        message={
          driverQuery.error instanceof Error
            ? driverQuery.error.message
            : "Unable to load driver details."
        }
        onRetry={() => driverQuery.refetch()}
      />
    );
  }

  const driver = driverQuery.data;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/drivers"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Drivers
      </Link>

      <PageHeader
        title={driver.name}
        description={driver.phone || "No phone"}
        action={
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="mt-0.5 text-sm font-medium">{driver.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="mt-0.5 text-sm font-medium">{driver.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1">
              <StatusBadge active={driver.is_active} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="mt-0.5 text-sm font-medium">{driver.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Joining date</p>
            <p className="mt-0.5 text-sm font-medium">
              {driver.joining_date ? formatDate(driver.joining_date) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly salary</p>
            <p className="mt-0.5 text-sm font-medium">
              {formatCurrency(driver.salary)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trips this month</p>
            <p className="mt-0.5 font-display text-lg font-semibold tabular">
              {monthTrips.isLoading ? "…" : monthTrips.data ?? "—"}
            </p>
          </div>
          {driver.notes && (
            <div className="sm:col-span-3">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm">{driver.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignmentHistory driverId={driver.id} />

      <DriverAttendanceSummary driverId={driver.id} />

      <DriverSalarySection driverId={driver.id} currentSalary={driver.salary} />

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit Driver"
        fullScreenMobile
      >
        <DriverForm
          initial={driver}
          submitLabel="Update Driver"
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
        />
      </Dialog>
    </div>
  );
}
