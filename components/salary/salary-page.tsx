"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSalaryBoard } from "@/lib/services/pay";
import { salaryRemaining } from "@/lib/calculations/payroll";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function SalaryPageClient() {
  const [monthValue, setMonthValue] = useState(currentMonthValue);
  const { year, month } = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return { year: y, month: m };
  }, [monthValue]);

  const query = useQuery({
    queryKey: queryKeys.salary.month(year, month),
    queryFn: () => getSalaryBoard(year, month),
  });

  return (
    <div>
      <PageHeader
        title="Salaries"
        description="Monthly salary, advances, and what is still to pay."
      />

      <div className="mb-4 max-w-xs">
        <Label htmlFor="salary-month">Month</Label>
        <Input
          id="salary-month"
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
        />
      </div>

      {query.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {query.isError && (
        <ErrorState
          message="Unable to load salaries."
          onRetry={() => query.refetch()}
        />
      )}
      {query.isSuccess && query.data.length === 0 && (
        <EmptyState
          title="No drivers yet"
          description="Add a driver before tracking salary."
          action={
            <Link
              href="/dashboard/drivers"
              className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Drivers
            </Link>
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <>
          <ul className="space-y-3 md:hidden">
            {query.data.map((row) => {
              const gross = row.month?.gross_salary ?? row.driver.salary;
              const remaining = row.month
                ? salaryRemaining(row.month.gross_salary, row.advances, row.payments)
                : null;
              return (
                <li key={row.driver.id} className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] p-4">
                  <Link
                    href={`/dashboard/drivers/${row.driver.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {row.driver.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.month
                      ? `${formatCurrency(gross)} gross · ${formatCurrency(remaining ?? 0)} remaining`
                      : "Month not started"}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Advances</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((row) => {
                  const remaining = row.month
                    ? salaryRemaining(row.month.gross_salary, row.advances, row.payments)
                    : null;
                  return (
                    <tr key={row.driver.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/dashboard/drivers/${row.driver.id}`}
                          className="text-primary hover:underline"
                        >
                          {row.driver.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {row.month ? formatCurrency(row.month.gross_salary) : "Not started"}
                      </td>
                      <td className="px-4 py-3">
                        {row.month ? formatCurrency(row.advances) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.month ? formatCurrency(row.payments) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {remaining === null ? "—" : formatCurrency(remaining)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
