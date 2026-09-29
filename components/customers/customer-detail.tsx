"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  getCustomer,
  getCustomerTrips,
  updateCustomer,
} from "@/lib/services/customers";
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
import { CustomerForm } from "@/components/customers/customer-form";
import { RelatedTrips } from "@/components/trips/related-trips";
import { useToast } from "@/components/providers/toast-provider";

export function CustomerDetailPage({ id }: { id: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const customerQuery = useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => getCustomer(id),
  });

  const tripsQuery = useQuery({
    queryKey: queryKeys.customers.trips(id),
    queryFn: () => getCustomerTrips(id),
    enabled: customerQuery.isSuccess,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCustomer>[1]) =>
      updateCustomer(id, data),
    onSuccess: async () => {
      toast("Customer updated", "success");
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  if (customerQuery.isLoading) {
    return <InlineLoading label="Loading customer..." />;
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <ErrorState
        message={
          customerQuery.error instanceof Error
            ? customerQuery.error.message
            : "Unable to load customer details."
        }
        onRetry={() => customerQuery.refetch()}
      />
    );
  }

  const customer = customerQuery.data;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/customers"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Customers
      </Link>

      <PageHeader
        title={customer.name}
        description={[customer.phone, customer.location].filter(Boolean).join(" · ") || "Customer"}
        action={
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="mt-0.5 text-sm font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="mt-0.5 text-sm font-medium">{customer.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="mt-0.5 text-sm font-medium">{customer.location || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1">
              <StatusBadge active={customer.is_active} />
            </p>
          </div>
        </CardContent>
      </Card>

      <RelatedTrips
        trips={tripsQuery.data}
        isLoading={tripsQuery.isLoading}
        isError={tripsQuery.isError}
        onRetry={() => tripsQuery.refetch()}
        secondaryLabel="Truck"
        secondary={(trip) => trip.trucks?.registration_number ?? "—"}
      />

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit Customer"
        fullScreenMobile
      >
        <CustomerForm
          initial={customer}
          submitLabel="Update Customer"
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
        />
      </Dialog>
    </div>
  );
}
