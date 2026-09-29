"use client";

import { FormEvent, useState } from "react";
import { truckSchema, type TruckInput } from "@/lib/validations";
import type { Truck, TruckStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const STATUS_OPTIONS: { value: TruckStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "running", label: "Running" },
  { value: "maintenance", label: "Maintenance" },
];

interface TruckFormProps {
  initial?: Truck;
  onSubmit: (data: TruckInput) => Promise<void>;
  submitLabel?: string;
}

export function TruckForm({
  initial,
  onSubmit,
  submitLabel = "Save Truck",
}: TruckFormProps) {
  const [registration_number, setReg] = useState(
    initial?.registration_number ?? ""
  );
  const [model, setModel] = useState(initial?.model ?? "");
  const [status, setStatus] = useState<TruckStatus>(
    initial?.status ?? "available"
  );
  const [is_active, setActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    const parsed = truckSchema.safeParse({
      registration_number,
      model,
      status,
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
        err instanceof Error ? err.message : "Unable to save truck."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="reg">Registration Number</Label>
        <Input
          id="reg"
          value={registration_number}
          onChange={(e) => setReg(e.target.value.toUpperCase())}
          placeholder="GJ08AW0236"
          autoComplete="off"
          required
        />
        {errors.registration_number && (
          <p className="mt-1 text-xs text-danger">
            {errors.registration_number}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="model">Truck Model</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Tata 407"
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TruckStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
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
