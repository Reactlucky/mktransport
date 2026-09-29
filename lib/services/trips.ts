import { createClient } from "@/lib/supabase/client";
import type { PaginatedResult, Trip, TripFilters } from "@/lib/types";
import type { TripInput } from "@/lib/validations";
import { getUserFacingError, toInputDate } from "@/lib/utils";
import { normalizeTrip, normalizeTrips } from "@/lib/services/normalize";

const TRIP_SELECT = `
  id,
  trip_date,
  truck_id,
  customer_id,
  from_location,
  to_location,
  rent,
  created_at,
  updated_at,
  trucks ( id, registration_number ),
  customers ( id, name )
`;

export async function listTrips(
  filters: TripFilters = {}
): Promise<PaginatedResult<Trip>> {
  const supabase = createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("trips")
    .select(TRIP_SELECT, { count: "exact" })
    .order("trip_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.dateFrom) {
    query = query.gte("trip_date", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("trip_date", filters.dateTo);
  }
  if (filters.truckId) {
    query = query.eq("truck_id", filters.truckId);
  }
  if (filters.customerId) {
    query = query.eq("customer_id", filters.customerId);
  }
  if (filters.search?.trim()) {
    const s = filters.search.trim();
    query = query.or(
      `from_location.ilike.%${s}%,to_location.ilike.%${s}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load trips. Please try again.")
    );
  }

  return {
    data: normalizeTrips((data ?? []) as unknown[]),
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function getTodayTrips(): Promise<Trip[]> {
  const supabase = createClient();
  const today = toInputDate();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("trip_date", today)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load today's trips.")
    );
  }
  return normalizeTrips((data ?? []) as unknown[]);
}

export async function getRecentTrips(limit = 5): Promise<Trip[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .order("trip_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load recent trips.")
    );
  }
  return normalizeTrips((data ?? []) as unknown[]);
}

export async function getTrip(id: string): Promise<Trip> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to load trip."));
  }
  return normalizeTrip(data as unknown as Record<string, unknown>);
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      trip_date: input.trip_date,
      truck_id: input.truck_id,
      customer_id: input.customer_id,
      from_location: input.from_location,
      to_location: input.to_location,
      rent: input.rent,
    })
    .select(TRIP_SELECT)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Trip could not be saved. Please check your details and try again."
      )
    );
  }
  return normalizeTrip(data as unknown as Record<string, unknown>);
}

export async function updateTrip(
  id: string,
  input: TripInput
): Promise<Trip> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      trip_date: input.trip_date,
      truck_id: input.truck_id,
      customer_id: input.customer_id,
      from_location: input.from_location,
      to_location: input.to_location,
      rent: input.rent,
    })
    .eq("id", id)
    .select(TRIP_SELECT)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Trip could not be updated. Please try again."
      )
    );
  }
  return normalizeTrip(data as unknown as Record<string, unknown>);
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to delete trip. Please try again.")
    );
  }
}
