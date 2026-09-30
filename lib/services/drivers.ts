import { createClient } from "@/lib/supabase/client";
import type { Driver, DriverStatusFilter } from "@/lib/types";
import type { DriverInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";

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
