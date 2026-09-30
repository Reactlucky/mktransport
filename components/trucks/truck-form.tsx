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
  const [registration_date, setRegistrationDate] = useState(
    initial?.registration_date ?? ""
  );
  const [fitness_valid_until, setFitness] = useState(
    initial?.fitness_valid_until ?? ""
  );
  const [tax_valid_until, setTax] = useState(initial?.tax_valid_until ?? "");
  const [tax_is_lifetime, setLifetimeTax] = useState(
    initial?.tax_is_lifetime ?? false
  );
  const [insurance_valid_until, setInsurance] = useState(
    initial?.insurance_valid_until ?? ""
  );
  const [pucc_valid_until, setPucc] = useState(initial?.pucc_valid_until ?? "");
  const [emi_due_on, setEmi] = useState(initial?.emi_due_on ?? "");
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
      registration_date,
      fitness_valid_until,
      tax_valid_until,
      tax_is_lifetime,
      insurance_valid_until,
      pucc_valid_until,
      emi_due_on,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="registration_date">Registration date</Label>
          <Input
            id="registration_date"
            type="date"
            value={registration_date ?? ""}
            onChange={(e) => setRegistrationDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fitness_valid_until">Fitness valid up to</Label>
          <Input
            id="fitness_valid_until"
            type="date"
            value={fitness_valid_until ?? ""}
            onChange={(e) => setFitness(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="tax_valid_until">Tax valid up to</Label>
          <Input
            id="tax_valid_until"
            type="date"
            value={tax_is_lifetime ? "" : (tax_valid_until ?? "")}
            onChange={(e) => setTax(e.target.value)}
            disabled={tax_is_lifetime}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-3 text-sm">
            <input
              type="checkbox"
              checked={tax_is_lifetime}
              onChange={(e) => setLifetimeTax(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Lifetime tax (LTT)
          </label>
        </div>
        <div>
          <Label htmlFor="insurance_valid_until">Insurance valid up to</Label>
          <Input
            id="insurance_valid_until"
            type="date"
            value={insurance_valid_until ?? ""}
            onChange={(e) => setInsurance(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pucc_valid_until">PUCC valid up to</Label>
          <Input
            id="pucc_valid_until"
            type="date"
            value={pucc_valid_until ?? ""}
            onChange={(e) => setPucc(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emi_due_on">EMI date</Label>
          <Input
            id="emi_due_on"
            type="date"
            value={emi_due_on ?? ""}
            onChange={(e) => setEmi(e.target.value)}
          />
        </div>
      </div>
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
