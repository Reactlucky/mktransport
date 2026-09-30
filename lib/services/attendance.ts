import { createClient } from "@/lib/supabase/client";
import type { AttendanceStatus, DriverAttendance } from "@/lib/types";
import { getUserFacingError } from "@/lib/utils";

const ATTENDANCE_COLS =
  "id, driver_id, attendance_date, status, created_at, updated_at";

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end };
}

export async function listAttendanceForDate(
  date: string
): Promise<DriverAttendance[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_attendance")
    .select(ATTENDANCE_COLS)
    .eq("attendance_date", date);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load attendance. Please try again.")
    );
  }
  return (data ?? []) as DriverAttendance[];
}

export async function listAttendanceForMonth(
  driverId: string,
  year: number,
  month: number
): Promise<DriverAttendance[]> {
  const supabase = createClient();
  const { start, end } = monthBounds(year, month);
  const { data, error } = await supabase
    .from("driver_attendance")
    .select(ATTENDANCE_COLS)
    .eq("driver_id", driverId)
    .gte("attendance_date", start)
    .lte("attendance_date", end)
    .order("attendance_date", { ascending: true });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load attendance. Please try again.")
    );
  }
  return (data ?? []) as DriverAttendance[];
}

export async function saveAttendance(input: {
  driverId: string;
  date: string;
  status: AttendanceStatus;
}): Promise<DriverAttendance> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_attendance")
    .upsert(
      {
        driver_id: input.driverId,
        attendance_date: input.date,
        status: input.status,
      },
      { onConflict: "driver_id,attendance_date" }
    )
    .select(ATTENDANCE_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to save attendance. Please try again.")
    );
  }
  return data as DriverAttendance;
}
