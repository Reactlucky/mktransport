import { createClient } from "@/lib/supabase/client";
import type { Driver, DriverStatusFilter } from "@/lib/types";
import type { DriverInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";
import { currentMonthRange } from "@/lib/services/trucks";

const DRIVER_COLS =
  "id, name, phone, address, joining_date, salary, notes, is_active, created_at, updated_at";

function normalizeDriver(row: Driver): Driver {
  return { ...row, salary: Number(row.salary) };
}

function driverPayload(input: Partial<DriverInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone || null;
  if (input.address !== undefined) payload.address = input.address || null;
  if (input.joining_date !== undefined) {
    payload.joining_date = input.joining_date || null;
  }
  if (input.salary !== undefined) payload.salary = input.salary;
  if (input.notes !== undefined) payload.notes = input.notes || null;
  if (input.is_active !== undefined) payload.is_active = input.is_active;
  return payload;
}

export async function listDrivers(
  search?: string,
  status: DriverStatusFilter = "all"
): Promise<Driver[]> {
  const supabase = createClient();
  let query = supabase
    .from("drivers")
    .select(DRIVER_COLS)
    .order("name", { ascending: true });

  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load drivers. Please try again.")
    );
  }
  return ((data ?? []) as Driver[]).map(normalizeDriver);
}

export async function getDriver(id: string): Promise<Driver> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select(DRIVER_COLS)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load driver details.")
    );
  }
  return normalizeDriver(data as Driver);
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .insert(driverPayload(input))
    .select(DRIVER_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to save driver. Please check the details and try again."
      )
    );
  }
  return normalizeDriver(data as Driver);
}

export async function updateDriver(
  id: string,
  input: Partial<DriverInput>
): Promise<Driver> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .update(driverPayload(input))
    .eq("id", id)
    .select(DRIVER_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to update driver. Please try again.")
    );
  }
  return normalizeDriver(data as Driver);
}

export async function countDriverTripsThisMonth(driverId: string): Promise<number> {
  const supabase = createClient();
  const { start, end } = currentMonthRange();
  const { data: assignments, error: assignmentError } = await supabase
    .from("driver_assignments")
    .select("truck_id, started_on, ended_on")
    .eq("driver_id", driverId)
    .lte("started_on", end)
    .or(`ended_on.is.null,ended_on.gte.${start}`);

  if (assignmentError) {
    throw new Error(
      getUserFacingError(assignmentError, "Unable to count this month's trips.")
    );
  }

  const rows = assignments ?? [];
  const truckIds = [...new Set(rows.map((row) => row.truck_id as string))];
  if (truckIds.length === 0) return 0;

  const { data: trips, error } = await supabase
    .from("trips")
    .select("trip_date, truck_id")
    .in("truck_id", truckIds)
    .gte("trip_date", start)
    .lte("trip_date", end);

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to count this month's trips."));
  }

  return (trips ?? []).filter((trip) =>
    rows.some((assignment) => {
      if (assignment.truck_id !== trip.truck_id) return false;
      if ((trip.trip_date as string) < (assignment.started_on as string)) return false;
      if (
        assignment.ended_on &&
        (trip.trip_date as string) > (assignment.ended_on as string)
      ) {
        return false;
      }
      return true;
    })
  ).length;
}
