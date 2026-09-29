"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getDriver, updateDriver } from "@/lib/services/drivers";
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
import { useToast } from "@/components/providers/toast-provider";

export function DriverDetailPage({ id }: { id: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const driverQuery = useQuery({
    queryKey: queryKeys.drivers.detail(id),
    queryFn: () => getDriver(id),
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
        </CardContent>
      </Card>

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
