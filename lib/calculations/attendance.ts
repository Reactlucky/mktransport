import type { AttendanceStatus } from "@/lib/types";

export function summarizeAttendance(rows: { status: AttendanceStatus }[]) {
  let present = 0;
  let absent = 0;
  let leave = 0;
  let halfDay = 0;

  for (const row of rows) {
    if (row.status === "present") present += 1;
    else if (row.status === "absent") absent += 1;
    else if (row.status === "leave") leave += 1;
    else halfDay += 1;
  }

  return {
    present,
    absent,
    leave,
    halfDay,
    presentDays: present + halfDay / 2,
  };
}

export function attendanceMonthDays(
  rows: { attendance_date: string; status: AttendanceStatus }[],
  year: number,
  month: number
) {
  const count = new Date(year, month, 0).getDate();
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const byDay = new Map<number, AttendanceStatus>();

  for (const row of rows) {
    if (!row.attendance_date.startsWith(prefix)) continue;
    const day = Number(row.attendance_date.slice(8, 10));
    if (day >= 1 && day <= count) byDay.set(day, row.status);
  }

  return Array.from({ length: count }, (_, index) => {
    const day = index + 1;
    return {
      day,
      date: `${prefix}${String(day).padStart(2, "0")}`,
      status: byDay.get(day) ?? null,
    };
  });
}
