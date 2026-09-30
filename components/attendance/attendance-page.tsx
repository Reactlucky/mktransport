"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAttendanceForDate, saveAttendance } from "@/lib/services/attendance";
import { listDrivers } from "@/lib/services/drivers";
import { queryKeys } from "@/lib/query-keys";
import type { AttendanceStatus, DriverAttendance } from "@/lib/types";
import { toInputDate } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

const STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "leave", label: "Leave" },
  { value: "half_day", label: "Half day" },
];

export function AttendancePageClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(toInputDate());

  const driversQuery = useQuery({
    queryKey: queryKeys.drivers.list("", "active"),
    queryFn: () => listDrivers(undefined, "active"),
  });

  const attendanceQuery = useQuery({
    queryKey: queryKeys.attendance.day(date),
    queryFn: () => listAttendanceForDate(date),
  });

  const mutation = useMutation({
    mutationFn: saveAttendance,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.attendance.day(input.date),
      });
      const key = queryKeys.attendance.day(input.date);
      const prev = queryClient.getQueryData<DriverAttendance[]>(key);
      queryClient.setQueryData<DriverAttendance[]>(key, (old) => {
        const next = (old ?? []).filter((row) => row.driver_id !== input.driverId);
        next.push({
          id: `pending-${input.driverId}`,
          driver_id: input.driverId,
          attendance_date: input.date,
          status: input.status,
          created_at: "",
          updated_at: "",
        });
        return next;
      });
      return { prev, key };
    },
    onError: (e: Error, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev);
      toast(e.message, "error");
    },
    onSettled: (_d, _e, input) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.day(input.date),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
  });

  const byDriver = new Map(
    (attendanceQuery.data ?? []).map((row) => [row.driver_id, row.status])
  );

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Tap a status for each driver. It saves immediately."
      />

      <div className="mb-4 max-w-xs">
        <Label htmlFor="attendance-date">Date</Label>
        <Input
          id="attendance-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {(driversQuery.isLoading || attendanceQuery.isLoading) && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {(driversQuery.isError || attendanceQuery.isError) && (
        <ErrorState
          message="Unable to load attendance."
          onRetry={() => {
            driversQuery.refetch();
            attendanceQuery.refetch();
          }}
        />
      )}

      {driversQuery.isSuccess &&
        attendanceQuery.isSuccess &&
        driversQuery.data.length === 0 && (
          <EmptyState
            title="No active drivers"
            description="Add a driver before marking attendance."
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

      {driversQuery.isSuccess &&
        attendanceQuery.isSuccess &&
        driversQuery.data.length > 0 && (
          <ul className="space-y-3">
            {driversQuery.data.map((driver) => {
              const selected = byDriver.get(driver.id);
              return (
                <li
                  key={driver.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="font-semibold">{driver.name}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STATUSES.map((status) => (
                      <Button
                        key={status.value}
                        type="button"
                        variant={selected === status.value ? "primary" : "outline"}
                        className={cn(
                          "h-11",
                          selected === status.value && "ring-2 ring-ring"
                        )}
                        onClick={() =>
                          mutation.mutate({
                            driverId: driver.id,
                            date,
                            status: status.value,
                          })
                        }
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}
