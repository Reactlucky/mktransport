"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tripSchema, type TripInput } from "@/lib/validations";
import type { Trip } from "@/lib/types";
import { listActiveTrucks } from "@/lib/services/trucks";
import { listActiveCustomers } from "@/lib/services/customers";
import { queryKeys } from "@/lib/query-keys";
import { toInputDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog } from "@/components/ui/dialog";
import { TruckForm } from "@/components/trucks/truck-form";
import { CustomerForm } from "@/components/customers/customer-form";
import { createTruck } from "@/lib/services/trucks";
import { createCustomer } from "@/lib/services/customers";
import { useToast } from "@/components/providers/toast-provider";

interface TripFormProps {
  initial?: Trip;
  onSubmit: (data: TripInput) => Promise<void>;
  submitLabel?: string;
}

export function TripForm({
  initial,
  onSubmit,
  submitLabel = "Save Trip",
}: TripFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [trip_date, setDate] = useState(
    initial?.trip_date ?? toInputDate()
  );
  const [truck_id, setTruckId] = useState(initial?.truck_id ?? "");
  const [customer_id, setCustomerId] = useState(initial?.customer_id ?? "");
  const [from_location, setFrom] = useState(initial?.from_location ?? "");
  const [to_location, setTo] = useState(initial?.to_location ?? "");
  const [rent, setRent] = useState(
    initial?.rent !== undefined ? String(initial.rent) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showTruck, setShowTruck] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = tripSchema.safeParse({
      trip_date,
      truck_id,
      customer_id,
      from_location,
      to_location,
      rent,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Trip could not be saved. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="trip_date">Date</Label>
            <Input
              id="trip_date"
              type="date"
              value={trip_date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            {errors.trip_date && (
              <p className="mt-1 text-xs text-danger">{errors.trip_date}</p>
            )}
          </div>
          <div>
            <Label htmlFor="rent">Rent (₹)</Label>
            <Input
              id="rent"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="850"
              required
            />
            {errors.rent && (
              <p className="mt-1 text-xs text-danger">{errors.rent}</p>
            )}
          </div>
        </div>

        <SearchableSelect
          label="Truck"
          value={truck_id}
          onChange={setTruckId}
          placeholder="Select truck"
          error={errors.truck_id}
          queryKey={queryKeys.trucks.active}
          addNewLabel="+ Add Truck"
          onAddNew={() => setShowTruck(true)}
          initialLabel={initial?.trucks?.registration_number}
          fetchOptions={async (search) => {
            const trucks = await listActiveTrucks(search);
            return trucks.map((t) => ({
              value: t.id,
              label: t.registration_number,
              subtitle: t.model ?? undefined,
            }));
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={from_location}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Abu Road"
              required
            />
            {errors.from_location && (
              <p className="mt-1 text-xs text-danger">{errors.from_location}</p>
            )}
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={to_location}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Ahmedabad"
              required
            />
            {errors.to_location && (
              <p className="mt-1 text-xs text-danger">{errors.to_location}</p>
            )}
          </div>
        </div>

        <SearchableSelect
          label="Customer"
          value={customer_id}
          onChange={setCustomerId}
          placeholder="Select customer"
          error={errors.customer_id}
          queryKey={queryKeys.customers.active}
          addNewLabel="+ Add Customer"
          onAddNew={() => setShowCustomer(true)}
          initialLabel={initial?.customers?.name}
          fetchOptions={async (search) => {
            const customers = await listActiveCustomers(search);
            return customers.map((c) => ({
              value: c.id,
              label: c.name,
              subtitle: c.location ?? undefined,
            }));
          }}
        />

        {formError && (
          <p className="text-sm text-danger" role="alert">
            {formError}
          </p>
        )}

        <div className="sticky bottom-0 -mx-1 border-t border-border bg-card pt-4 pb-[env(safe-area-inset-bottom)] sm:static sm:border-0 sm:bg-transparent sm:pt-2 sm:pb-0">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            size="lg"
            loading={loading}
          >
            {loading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog
        open={showTruck}
        onClose={() => setShowTruck(false)}
        title="Add Truck"
        fullScreenMobile
      >
        <TruckForm
          submitLabel="Add Truck"
          onSubmit={async (data) => {
            const truck = await createTruck(data);
            await queryClient.invalidateQueries({
              queryKey: queryKeys.trucks.all,
            });
            setTruckId(truck.id);
            setShowTruck(false);
            toast("Truck added", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={showCustomer}
        onClose={() => setShowCustomer(false)}
        title="Add Customer"
        fullScreenMobile
      >
        <CustomerForm
          submitLabel="Add Customer"
          onSubmit={async (data) => {
            const customer = await createCustomer(data);
            await queryClient.invalidateQueries({
              queryKey: queryKeys.customers.all,
            });
            setCustomerId(customer.id);
            setShowCustomer(false);
            toast("Customer added", "success");
          }}
        />
      </Dialog>
    </>
  );
}
