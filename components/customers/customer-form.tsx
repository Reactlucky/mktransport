"use client";

import { FormEvent, useState } from "react";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  initial?: Customer;
  onSubmit: (data: CustomerInput) => Promise<void>;
  submitLabel?: string;
}

export function CustomerForm({
  initial,
  onSubmit,
  submitLabel = "Save Customer",
}: CustomerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [is_active, setActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    const parsed = customerSchema.safeParse({
      name,
      phone,
      location,
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
        err instanceof Error ? err.message : "Unable to save customer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="cname">Customer Name</Label>
        <Input
          id="cname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="SK Granite"
          required
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Abu Road"
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
