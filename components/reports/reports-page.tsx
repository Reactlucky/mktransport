"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerWiseReport,
  getMonthlyTripSummary,
  getTruckWiseReport,
} from "@/lib/services/dashboard";
import { queryKeys } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/ui/states";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ReportsPageClient() {
  const now = new Date();
  const [monthValue, setMonthValue] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const { year, month } = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return { year: y, month: m };
  }, [monthValue]);

  const monthly = useQuery({
    queryKey: queryKeys.reports.monthly(year, month),
    queryFn: () => getMonthlyTripSummary(year, month),
  });

  const truckWise = useQuery({
    queryKey: queryKeys.reports.truckWise(year, month),
    queryFn: () => getTruckWiseReport(year, month),
  });

  const customerWise = useQuery({
    queryKey: queryKeys.reports.customerWise(year, month),
    queryFn: () => getCustomerWiseReport(year, month),
  });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Monthly earnings by fleet and customer."
      />

      <div className="mb-6 max-w-xs">
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
        />
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Monthly totals
        </h2>
        {monthly.isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
        {monthly.isError && (
          <ErrorState
            message="Unable to load monthly report."
            onRetry={() => monthly.refetch()}
          />
        )}
        {monthly.isSuccess && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Total trips</p>
                <p className="mt-1 text-3xl font-semibold">
                  {monthly.data.trip_count}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Total rent</p>
                <p className="mt-1 text-3xl font-semibold text-primary">
                  {formatCurrency(monthly.data.total_rent)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Truck-wise
        </h2>
        {truckWise.isLoading && <Skeleton className="h-40" />}
        {truckWise.isError && (
          <ErrorState
            message="Unable to load truck report."
            onRetry={() => truckWise.refetch()}
          />
        )}
        {truckWise.isSuccess && truckWise.data.length === 0 && (
          <EmptyState title="No trips this month" />
        )}
        {truckWise.isSuccess && truckWise.data.length > 0 && (
          <>
            <div className="space-y-2 md:hidden">
              {truckWise.data.map((row) => (
                <Card key={row.truck_id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold">{row.registration_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.trip_count} trips
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(row.total_rent)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Truck</th>
                      <th className="px-4 py-3 font-medium">Trips</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Total Rent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {truckWise.data.map((row) => (
                      <tr
                        key={row.truck_id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.registration_number}
                        </td>
                        <td className="px-4 py-3">{row.trip_count}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(row.total_rent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Customer-wise
        </h2>
        {customerWise.isLoading && <Skeleton className="h-40" />}
        {customerWise.isError && (
          <ErrorState
            message="Unable to load customer report."
            onRetry={() => customerWise.refetch()}
          />
        )}
        {customerWise.isSuccess && customerWise.data.length === 0 && (
          <EmptyState title="No trips this month" />
        )}
        {customerWise.isSuccess && customerWise.data.length > 0 && (
          <>
            <div className="space-y-2 md:hidden">
              {customerWise.data.map((row) => (
                <Card key={row.customer_id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.trip_count} trips
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(row.total_rent)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="hidden md:block">
              <CardHeader className="sr-only">Customer report</CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Trips</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Total Rent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerWise.data.map((row) => (
                      <tr
                        key={row.customer_id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">{row.trip_count}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(row.total_rent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}
