"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  getCustomerTrips,
} from "@/lib/services/customers";
import { queryKeys } from "@/lib/query-keys";
import type { Customer } from "@/lib/types";
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
import { CustomerForm } from "@/components/customers/customer-form";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CustomersPageClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [historyFor, setHistoryFor] = useState<Customer | null>(null);

  const query = useQuery({
    queryKey: queryKeys.customers.list(search),
    queryFn: () => listCustomers(search || undefined),
    staleTime: 60_000,
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.customers.trips(historyFor?.id ?? ""),
    queryFn: () => getCustomerTrips(historyFor!.id),
    enabled: !!historyFor,
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      toast("Customer added successfully", "success");
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all,
      });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCustomer>[1];
    }) => updateCustomer(id, data),
    onSuccess: async () => {
      toast("Customer updated", "success");
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all,
      });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Parties you haul for."
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add Customer
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
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
              : "Unable to load customers."
          }
          onRetry={() => query.refetch()}
        />
      )}

      {query.isSuccess && query.data.length === 0 && (
        <EmptyState
          title="No customers yet"
          description="Add customers so trip entry is faster."
          action={
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Add Customer
            </Button>
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {query.data.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.phone || "No phone"}
                      {c.location ? ` · ${c.location}` : ""}
                    </p>
                  </div>
                  <StatusBadge active={c.is_active} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(c)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryFor(c)}
                  >
                    Trip history
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
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.phone || "—"}</td>
                    <td className="px-4 py-3">{c.location || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={c.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-3 text-xs font-medium text-primary hover:underline"
                        onClick={() => setHistoryFor(c)}
                      >
                        History
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => setEditing(c)}
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

      <Dialog open={open} onClose={() => setOpen(false)} title="Add Customer" fullScreenMobile>
        <CustomerForm
          submitLabel="Add Customer"
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
        />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Customer"
        fullScreenMobile
      >
        {editing && (
          <CustomerForm
            initial={editing}
            submitLabel="Update Customer"
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({ id: editing.id, data });
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={!!historyFor}
        onClose={() => setHistoryFor(null)}
        title={historyFor ? `Trips · ${historyFor.name}` : "Trip history"}
        className="max-w-xl"
        fullScreenMobile
      >
        {historyQuery.isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {historyQuery.isSuccess && historyQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">No trips yet.</p>
        )}
        {historyQuery.isSuccess && historyQuery.data.length > 0 && (
          <ul className="space-y-2">
            {historyQuery.data.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {t.from_location} → {t.to_location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(t.trip_date)} ·{" "}
                    {t.trucks?.registration_number}
                  </p>
                </div>
                <span className="font-semibold">{formatCurrency(t.rent)}</span>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </div>
  );
}
