"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listAttendanceForMonth } from "@/lib/services/attendance";
import { attendanceMonthDays, summarizeAttendance } from "@/lib/calculations/attendance";
import { AttendanceCalendar } from "@/components/charts/driver-charts";
import { queryKeys } from "@/lib/query-keys";
import { toInputDate } from "@/lib/utils";
import { ErrorState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function DriverAttendanceSummary({ driverId }: { driverId: string }) {
  const [monthValue, setMonthValue] = useState(currentMonthValue);
  const [year, month] = monthValue.split("-").map(Number);

  const query = useQuery({
    queryKey: queryKeys.drivers.attendance(driverId, monthValue),
    queryFn: () => listAttendanceForMonth(driverId, year, month),
  });

  const summary = summarizeAttendance(query.data ?? []);

  return (
    <section className="mt-6" aria-labelledby="attendance-summary-heading">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="attendance-summary-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Attendance
        </h2>
        <div>
          <Label htmlFor="attendance-month" className="sr-only">
            Month
          </Label>
          <Input
            id="attendance-month"
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="sm:w-44"
          />
        </div>
      </div>

      {query.isLoading && <Skeleton className="h-20 w-full" />}
      {query.isError && (
        <ErrorState
          message="Unable to load attendance."
          onRetry={() => query.refetch()}
        />
      )}
      {query.isSuccess && (
        <AttendanceCalendar
          days={attendanceMonthDays(query.data ?? [], year, month)}
          today={toInputDate()}
          presentDays={summary.presentDays}
          absent={summary.absent}
          leave={summary.leave}
          halfDay={summary.halfDay}
        />
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        A half day counts as half a present day.{" "}
        <Link href="/dashboard/attendance" className="text-primary hover:underline">
          Mark today
        </Link>
      </p>
    </section>
  );
}
