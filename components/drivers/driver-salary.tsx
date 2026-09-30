"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSalaryMonth,
  listPayEntries,
  openSalaryMonth,
  recordPayEntry,
} from "@/lib/services/pay";
import { salaryRemaining, sumAmounts } from "@/lib/calculations/payroll";
import { queryKeys } from "@/lib/query-keys";
import type { PayEntryKind } from "@/lib/types";
import { formatCurrency, formatDate, toInputDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function DriverSalarySection({
  driverId,
  currentSalary,
}: {
  driverId: string;
  currentSalary: number;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [monthValue, setMonthValue] = useState(currentMonthValue);
  const [year, month] = monthValue.split("-").map(Number);
  const [recording, setRecording] = useState<PayEntryKind | null>(null);

  const monthQuery = useQuery({
    queryKey: queryKeys.drivers.salary(driverId, monthValue),
    queryFn: () => getSalaryMonth(driverId, year, month),
  });

  const entriesQuery = useQuery({
    queryKey: [...queryKeys.drivers.salary(driverId, monthValue), "entries"],
    queryFn: () => listPayEntries(monthQuery.data!.id),
    enabled: Boolean(monthQuery.data?.id),
  });

  const openMutation = useMutation({
    mutationFn: () => openSalaryMonth(driverId, year, month),
    onSuccess: async () => {
      toast("Salary month started", "success");
      await queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.salary.month(year, month) });
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const salaryMonth = monthQuery.data;
  const entries = entriesQuery.data ?? [];
  const advances = sumAmounts(
    entries.filter((entry) => entry.kind === "advance").map((entry) => entry.amount)
  );
  const payments = sumAmounts(
    entries
      .filter((entry) => entry.kind === "salary_payment")
      .map((entry) => entry.amount)
  );
  const remaining = salaryMonth
    ? salaryRemaining(salaryMonth.gross_salary, advances, payments)
    : salaryRemaining(currentSalary, 0, 0);

  return (
    <section className="mt-6" aria-labelledby="salary-heading">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="salary-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Salary
        </h2>
        <Input
          type="month"
          aria-label="Salary month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
          className="sm:w-44"
        />
      </div>

      {monthQuery.isLoading && <Skeleton className="h-24 w-full" />}
      {monthQuery.isError && (
        <ErrorState
          message="Unable to load salary."
          onRetry={() => monthQuery.refetch()}
        />
      )}

      {monthQuery.isSuccess && !salaryMonth && (
        <div className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Current salary on the driver record is {formatCurrency(currentSalary)}.
            Starting the month saves that amount and later salary changes will not rewrite it.
          </p>
          <Button
            type="button"
            className="mt-3"
            loading={openMutation.isPending}
            onClick={() => openMutation.mutate()}
          >
            {openMutation.isPending ? "Starting..." : "Start this month"}
          </Button>
        </div>
      )}

      {salaryMonth && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label="Gross" value={formatCurrency(salaryMonth.gross_salary)} />
            <Figure label="Advances" value={formatCurrency(advances)} />
            <Figure label="Paid" value={formatCurrency(payments)} />
            <Figure label="Remaining" value={formatCurrency(remaining)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setRecording("advance")}>
              Record advance
            </Button>
            <Button type="button" variant="outline" onClick={() => setRecording("salary_payment")}>
              Record payment
            </Button>
          </div>
          {entriesQuery.isLoading && <Skeleton className="mt-3 h-16 w-full" />}
          {entriesQuery.isSuccess && entries.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No advances or payments yet.</p>
          )}
          {entries.length > 0 && (
            <ul className="mt-3 space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {entry.kind === "advance" ? "Advance" : "Salary payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.entry_date)}
                      {entry.notes ? ` · ${entry.notes}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(entry.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        <Link href="/dashboard/salary" className="text-primary hover:underline">
          All salaries this month
        </Link>
      </p>

      <RecordPayDialog
        open={recording !== null}
        kind={recording ?? "advance"}
        onClose={() => setRecording(null)}
        driverId={driverId}
        salaryMonthId={salaryMonth?.id ?? ""}
        year={year}
        month={month}
        monthValue={monthValue}
      />
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function RecordPayDialog({
  open,
  kind,
  onClose,
  driverId,
  salaryMonthId,
  year,
  month,
  monthValue,
}: {
  open: boolean;
  kind: PayEntryKind;
  onClose: () => void;
  driverId: string;
  salaryMonthId: string;
  year: number;
  month: number;
  monthValue: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: recordPayEntry,
    onSuccess: async () => {
      toast(kind === "advance" ? "Advance recorded" : "Payment recorded", "success");
      setAmount("");
      setNotes("");
      setError("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.salary(driverId, monthValue),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.salary.month(year, month),
      });
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!entryDate || !salaryMonthId) {
      setError("Start the salary month before recording an amount.");
      return;
    }
    mutation.mutate({
      driverId,
      salaryMonthId,
      kind,
      amount: value,
      entryDate,
      notes,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={kind === "advance" ? "Record advance" : "Record salary payment"}
      fullScreenMobile
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="pay-amount">Amount (₹)</Label>
          <Input
            id="pay-amount"
            type="number"
            inputMode="numeric"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pay-date">Date</Label>
          <Input
            id="pay-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="pay-notes">Notes</Label>
          <Input
            id="pay-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
