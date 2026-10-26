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
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

const STATUSES: { value: AttendanceStatus; label: string; short: string }[] = [
  { value: "present", label: "Present", short: "Present" },
  { value: "absent", label: "Absent", short: "Absent" },
  { value: "leave", label: "Leave", short: "Leave" },
  { value: "half_day", label: "Half day", short: "Half" },
];

const SELECTED_TONE: Record<AttendanceStatus, string> = {
  present:
    "border-transparent bg-[color-mix(in_srgb,var(--success)_16%,white)] text-success dark:bg-[color-mix(in_srgb,var(--success)_24%,transparent)]",
  absent:
    "border-transparent bg-[color-mix(in_srgb,var(--danger)_14%,white)] text-danger dark:bg-[color-mix(in_srgb,var(--danger)_22%,transparent)]",
  leave:
    "border-transparent bg-[color-mix(in_srgb,var(--primary)_14%,white)] text-primary dark:bg-[color-mix(in_srgb,var(--primary)_24%,transparent)]",
  half_day:
    "border-transparent bg-[color-mix(in_srgb,var(--warning)_18%,white)] text-warning dark:bg-[color-mix(in_srgb,var(--warning)_26%,transparent)]",
};

const STATUS_TEXT: Record<AttendanceStatus, string> = {
  present: "text-success",
  absent: "text-danger",
  leave: "text-primary",
  half_day: "text-warning",
};

const STATUS_ACCENT: Record<AttendanceStatus, string> = {
  present: "var(--success)",
  absent: "var(--danger)",
  leave: "var(--primary)",
  half_day: "var(--warning)",
};

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
        description="Tap the status for each driver. It saves immediately."
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
                className="inline-flex h-11 items-center rounded-[3px] bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Drivers
              </Link>
            }
          />
        )}

      {driversQuery.isSuccess &&
        attendanceQuery.isSuccess &&
        driversQuery.data.length > 0 && (
          <>
            <AttendanceTally drivers={driversQuery.data.map((driver) => driver.id)} byDriver={byDriver} />
            <ul className="space-y-2">
              {driversQuery.data.map((driver) => {
                const selected = byDriver.get(driver.id);
                return (
                  <li
                    key={driver.id}
                    className="rounded-[10px] border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]"
                    style={
                      selected
                        ? { boxShadow: `inset 3px 0 0 ${STATUS_ACCENT[selected]}, var(--shadow-card)` }
                        : undefined
                    }
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{driver.name}</p>
                        <p className={cn("text-xs", selected ? STATUS_TEXT[selected] : "text-muted-foreground")}>
                          {selected
                            ? STATUSES.find((status) => status.value === selected)?.label
                            : "Not marked"}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:w-72">
                        {STATUSES.map((status) => {
                          const active = selected === status.value;
                          return (
                            <button
                              key={status.value}
                              type="button"
                              aria-pressed={active}
                              className={cn(
                                "h-9 rounded-[6px] border text-xs font-medium transition-colors",
                                active
                                  ? SELECTED_TONE[status.value]
                                  : "border-border text-muted-foreground hover:bg-muted"
                              )}
                              onClick={() =>
                                mutation.mutate({
                                  driverId: driver.id,
                                  date,
                                  status: status.value,
                                })
                              }
                            >
                              {status.short}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
    </div>
  );
}

function AttendanceTally({
  drivers,
  byDriver,
}: {
  drivers: string[];
  byDriver: Map<string, AttendanceStatus>;
}) {
  const counts = { present: 0, absent: 0, leave: 0, half_day: 0, unmarked: 0 };
  for (const id of drivers) {
    const status = byDriver.get(id);
    if (!status) counts.unmarked += 1;
    else counts[status] += 1;
  }

  return (
    <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span>
        <span className="font-semibold text-success tabular">{counts.present}</span> present
      </span>
      <span>
        <span className="font-semibold text-warning tabular">{counts.half_day}</span> half day
      </span>
      <span>
        <span className="font-semibold text-primary tabular">{counts.leave}</span> leave
      </span>
      <span>
        <span className="font-semibold text-danger tabular">{counts.absent}</span> absent
      </span>
      <span>
        <span className="font-semibold text-foreground tabular">{counts.unmarked}</span> not marked
      </span>
    </p>
  );
}
