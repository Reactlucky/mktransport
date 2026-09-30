"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import {
  listCustomers,
  createCustomer,
  updateCustomer,
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

export function CustomersPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const query = useQuery({
    queryKey: queryKeys.customers.list(search),
    queryFn: () => listCustomers(search || undefined),
    staleTime: 60_000,
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
                className="cursor-pointer rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] p-4 hover:bg-muted/40"
                onClick={() => router.push(`/dashboard/customers/${c.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/customers/${c.id}`}
                      className="font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {c.phone || "No phone"}
                      {c.location ? ` · ${c.location}` : ""}
                    </p>
                  </div>
                  <StatusBadge active={c.is_active} />
                </div>
                <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                    onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                  >
                    Trip history
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] md:block">
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
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                    onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.phone || "—"}</td>
                    <td className="px-4 py-3">{c.location || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={c.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="mr-3 text-xs font-medium text-primary hover:underline"
                      >
                        History
                      </Link>
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
    </div>
  );
}
