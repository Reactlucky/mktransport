"use client";

import { FormEvent, useState } from "react";
import { driverSchema, type DriverInput } from "@/lib/validations";
import type { Driver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [is_active, setActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    const parsed = driverSchema.safeParse({ name, phone, is_active });
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
