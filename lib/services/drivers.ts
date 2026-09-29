import { createClient } from "@/lib/supabase/client";
import type { Driver } from "@/lib/types";
import type { DriverInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";

const DRIVER_COLS = "id, name, phone, is_active, created_at, updated_at";

export async function listDrivers(search?: string): Promise<Driver[]> {
  const supabase = createClient();
  let query = supabase
    .from("drivers")
    .select(DRIVER_COLS)
    .order("name", { ascending: true });

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
  return (data ?? []) as Driver[];
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
  return data as Driver;
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .insert({
      name: input.name,
      phone: input.phone || null,
      is_active: input.is_active,
    })
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
  return data as Driver;
}

export async function updateDriver(
  id: string,
  input: Partial<DriverInput>
): Promise<Driver> {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone || null;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const { data, error } = await supabase
    .from("drivers")
    .update(payload)
    .eq("id", id)
    .select(DRIVER_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to update driver. Please try again.")
    );
  }
  return data as Driver;
}
