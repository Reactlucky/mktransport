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
