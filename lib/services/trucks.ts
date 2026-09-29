import { createClient } from "@/lib/supabase/client";
import type { Trip, Truck, TruckStatus } from "@/lib/types";
import type { TruckInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";
import { normalizeTrips } from "@/lib/services/normalize";

const TRUCK_COLS =
  "id, registration_number, model, status, is_active, created_at, updated_at";

export async function listTrucks(search?: string): Promise<Truck[]> {
  const supabase = createClient();
  let query = supabase
    .from("trucks")
    .select(TRUCK_COLS)
    .order("registration_number", { ascending: true });

  if (search?.trim()) {
    query = query.or(
      `registration_number.ilike.%${search.trim()}%,model.ilike.%${search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load trucks. Please try again.")
    );
  }
  return (data ?? []) as Truck[];
}

export async function listActiveTrucks(search?: string): Promise<Truck[]> {
  const supabase = createClient();
  let query = supabase
    .from("trucks")
    .select(TRUCK_COLS)
    .eq("is_active", true)
    .order("registration_number", { ascending: true })
    .limit(50);

  if (search?.trim()) {
    query = query.ilike("registration_number", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load trucks. Please try again.")
    );
  }
  return (data ?? []) as Truck[];
}

export async function getTruck(id: string): Promise<Truck> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trucks")
    .select(TRUCK_COLS)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load truck details.")
    );
  }
  return data as Truck;
}

export async function getTruckTrips(truckId: string): Promise<Trip[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      `
      id,
      trip_date,
      from_location,
      to_location,
      rent,
      truck_id,
      customer_id,
      created_at,
      updated_at,
      customers ( id, name )
    `
    )
    .eq("truck_id", truckId)
    .order("trip_date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to load trip history."));
  }
  return normalizeTrips((data ?? []) as unknown[]);
}

export async function createTruck(input: TruckInput): Promise<Truck> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trucks")
    .insert({
      registration_number: input.registration_number.toUpperCase(),
      model: input.model || null,
      status: input.status,
      is_active: input.is_active,
    })
    .select(TRUCK_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to save truck. Please check the details and try again."
      )
    );
  }
  return data as Truck;
}

export async function updateTruck(
  id: string,
  input: Partial<TruckInput>
): Promise<Truck> {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (input.registration_number !== undefined) {
    payload.registration_number = input.registration_number.toUpperCase();
  }
  if (input.model !== undefined) payload.model = input.model || null;
  if (input.status !== undefined) payload.status = input.status;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const { data, error } = await supabase
    .from("trucks")
    .update(payload)
    .eq("id", id)
    .select(TRUCK_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to update truck. Please try again."
      )
    );
  }
  return data as Truck;
}

export async function updateTruckStatus(
  id: string,
  status: TruckStatus
): Promise<Truck> {
  return updateTruck(id, { status });
}

export async function toggleTruckActive(
  id: string,
  is_active: boolean
): Promise<Truck> {
  return updateTruck(id, { is_active });
}
