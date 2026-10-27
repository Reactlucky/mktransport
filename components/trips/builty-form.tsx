"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { builtyBalance, formatBuiltyAmount } from "@/lib/calculations/builty";
import type { Builty, Trip } from "@/lib/types";
import { builtySchema, type BuiltyInput } from "@/lib/validations";
import { toInputDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

function readMoney(value: string): number | null {
  if (value.trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function BuiltyForm({
  trip,
  existing,
  onSubmit,
}: {
  trip: Trip;
  existing: Builty | null;
  onSubmit: (data: BuiltyInput) => Promise<void>;
}) {
  const [builtyNumber, setBuiltyNumber] = useState(existing?.builty_number ?? "");
  const [builtyDate, setBuiltyDate] = useState(existing?.builty_date ?? toInputDate());
  const [customerName, setCustomerName] = useState(
    existing?.customer_name ?? trip.customers?.name ?? ""
  );
  const [truckRegistration, setTruckRegistration] = useState(
    existing?.truck_registration ?? trip.trucks?.registration_number ?? ""
  );
  const [fromLocation, setFromLocation] = useState(
    existing?.from_location ?? trip.from_location
  );
  const [toLocation, setToLocation] = useState(existing?.to_location ?? trip.to_location);
  const [goods, setGoods] = useState(existing?.goods_description ?? "");
  const [packages, setPackages] = useState(
    existing ? String(existing.package_count) : ""
  );
  const [freight, setFreight] = useState(
    existing ? String(existing.freight_amount) : String(trip.rent)
  );
  const [advance, setAdvance] = useState(existing ? String(existing.advance_amount) : "0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existing?.builty_number) setBuiltyNumber(existing.builty_number);
  }, [existing?.builty_number]);

  const balance = useMemo(() => {
    const freightAmount = readMoney(freight);
    const advanceAmount = readMoney(advance);
    if (freightAmount == null || advanceAmount == null) return null;
    return builtyBalance(freightAmount, advanceAmount);
  }, [freight, advance]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = builtySchema.safeParse({
      builty_date: builtyDate,
      customer_name: customerName,
      truck_registration: truckRegistration,
      from_location: fromLocation,
      to_location: toLocation,
      goods_description: goods,
      package_count: packages,
      freight_amount: freight,
      advance_amount: advance,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "The builty could not be saved. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="builty_number">Builty number</Label>
          <Input
            id="builty_number"
            value={builtyNumber || "Assigned when you generate"}
            readOnly
            tabIndex={-1}
            className="bg-base-200"
          />
        </div>
        <div>
          <Label htmlFor="builty_date">Date</Label>
          <Input
            id="builty_date"
            type="date"
            value={builtyDate}
            onChange={(event) => setBuiltyDate(event.target.value)}
            required
          />
          <FieldError message={errors.builty_date} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="customer_name">Customer name</Label>
          <Input
            id="customer_name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            required
          />
          <FieldError message={errors.customer_name} />
        </div>
        <div>
          <Label htmlFor="truck_registration">Truck registration number</Label>
          <Input
            id="truck_registration"
            value={truckRegistration}
            onChange={(event) => setTruckRegistration(event.target.value)}
            required
          />
          <FieldError message={errors.truck_registration} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="from_location">From location</Label>
          <Input
            id="from_location"
            value={fromLocation}
            onChange={(event) => setFromLocation(event.target.value)}
            required
          />
          <FieldError message={errors.from_location} />
        </div>
        <div>
          <Label htmlFor="to_location">To location</Label>
          <Input
            id="to_location"
            value={toLocation}
            onChange={(event) => setToLocation(event.target.value)}
            required
          />
          <FieldError message={errors.to_location} />
        </div>
      </div>

      <div>
        <Label htmlFor="goods_description">Goods description</Label>
        <textarea
          id="goods_description"
          value={goods}
          onChange={(event) => setGoods(event.target.value)}
          rows={3}
          required
          className="textarea textarea-lg w-full"
        />
        <FieldError message={errors.goods_description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="package_count">Number of packages</Label>
          <Input
            id="package_count"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            value={packages}
            onChange={(event) => setPackages(event.target.value)}
            required
          />
          <FieldError message={errors.package_count} />
        </div>
        <div>
          <Label htmlFor="freight_amount">Freight amount (₹)</Label>
          <Input
            id="freight_amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={freight}
            onChange={(event) => setFreight(event.target.value)}
            required
          />
          <FieldError message={errors.freight_amount} />
        </div>
        <div>
          <Label htmlFor="advance_amount">Advance amount (₹)</Label>
          <Input
            id="advance_amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={advance}
            onChange={(event) => setAdvance(event.target.value)}
            required
          />
          <FieldError message={errors.advance_amount} />
        </div>
      </div>

      <div className="sm:max-w-xs">
        <Label htmlFor="balance_amount">Balance amount</Label>
        <Input
          id="balance_amount"
          value={balance == null ? "—" : formatBuiltyAmount(balance)}
          readOnly
          tabIndex={-1}
          className="bg-base-200 font-semibold"
        />
      </div>

      {formError && (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      )}

      <div className="sticky bottom-0 -mx-1 border-t border-border bg-card pt-4 pb-[env(safe-area-inset-bottom)] sm:static sm:border-0 sm:bg-transparent sm:pt-2 sm:pb-0">
        <Button type="submit" className="w-full sm:w-auto" size="lg" loading={loading}>
          {loading ? "Generating..." : "Generate Builty"}
        </Button>
      </div>
    </form>
  );
}
