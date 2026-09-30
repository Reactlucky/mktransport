"use client";

import { FormEvent, useState } from "react";
import { driverSchema, type DriverInput } from "@/lib/validations";
import type { Driver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DriverFormProps {
  initial?: Driver;
  onSubmit: (data: DriverInput) => Promise<void>;
  submitLabel?: string;
}

export function DriverForm({
  initial,
  onSubmit,
  submitLabel = "Save Driver",
}: DriverFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [joining_date, setJoining] = useState(initial?.joining_date ?? "");
  const [salary, setSalary] = useState(
    initial?.salary !== undefined ? String(initial.salary) : "0"
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [is_active, setActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    const parsed = driverSchema.safeParse({
      name,
      phone,
      address,
      joining_date,
      salary,
      notes,
      is_active,
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
        err instanceof Error ? err.message : "Unable to save driver."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="dname">Name</Label>
        <Input
          id="dname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ramesh Kumar"
          required
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dphone">Phone</Label>
          <Input
            id="dphone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9988776655"
          />
        </div>
        <div>
          <Label htmlFor="djoining">Joining date</Label>
          <Input
            id="djoining"
            type="date"
            value={joining_date}
            onChange={(e) => setJoining(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="daddress">Address</Label>
        <Input
          id="daddress"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Abu Road"
        />
      </div>
      <div>
        <Label htmlFor="dsalary">Monthly salary (₹)</Label>
        <Input
          id="dsalary"
          type="number"
          inputMode="numeric"
          min={0}
          step="1"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        {errors.salary && (
          <p className="mt-1 text-xs text-danger">{errors.salary}</p>
        )}
      </div>
      <div>
        <Label htmlFor="dnotes">Notes</Label>
        <textarea
          id="dnotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={cn(
            "flex w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
          )}
          placeholder="Optional"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={is_active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 rounded border-input"
        />
        Active
      </label>
      {formError && (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full sm:w-auto" loading={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
