import { createClient } from "@/lib/supabase/client";
import type { Trip, Truck, TruckStatus } from "@/lib/types";
import type { TruckInput } from "@/lib/validations";
import { getUserFacingError, toInputDate } from "@/lib/utils";
import { normalizeTrips } from "@/lib/services/normalize";

const BASE_COLS =
  "id, registration_number, model, status, is_active, created_at, updated_at";
const TRUCK_COLS =
  "id, registration_number, model, status, is_active, registration_date, fitness_valid_until, tax_valid_until, tax_is_lifetime, insurance_valid_until, pucc_valid_until, emi_due_on, created_at, updated_at";

const PAPERS_MISSING =
  "Vehicle dates are not saved yet. Run supabase/migrations/007_truck_papers.sql in the Supabase SQL editor, then try again.";

let papersAvailable = true;

function truckColumns() {
  return papersAvailable ? TRUCK_COLS : BASE_COLS;
}

function asTruck(row: Partial<Truck> & Pick<Truck, "id">): Truck {
  return {
    id: row.id,
    registration_number: row.registration_number ?? "",
    model: row.model ?? null,
    status: row.status ?? "available",
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
    registration_date: row.registration_date ?? null,
    fitness_valid_until: row.fitness_valid_until ?? null,
    tax_valid_until: row.tax_valid_until ?? null,
    tax_is_lifetime: Boolean(row.tax_is_lifetime),
    insurance_valid_until: row.insurance_valid_until ?? null,
    pucc_valid_until: row.pucc_valid_until ?? null,
    emi_due_on: row.emi_due_on ?? null,
  };
}

async function readTruckRows(
  run: (
    columns: string
  ) => Promise<{ data: unknown; error: { code?: string } | null }>
): Promise<Truck[]> {
  let result = await run(truckColumns());
  if (result.error?.code === "42703" && papersAvailable) {
    papersAvailable = false;
    result = await run(BASE_COLS);
  }
  if (result.error) {
    throw new Error(
      getUserFacingError(result.error, "Unable to load trucks. Please try again.")
    );
  }
  return ((result.data ?? []) as Array<Partial<Truck> & Pick<Truck, "id">>).map(asTruck);
}

function dateOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function paperFields(input: TruckInput) {
  return {
    registration_date: dateOrNull(input.registration_date),
    fitness_valid_until: dateOrNull(input.fitness_valid_until),
    tax_is_lifetime: input.tax_is_lifetime,
    tax_valid_until: input.tax_is_lifetime ? null : dateOrNull(input.tax_valid_until),
    insurance_valid_until: dateOrNull(input.insurance_valid_until),
    pucc_valid_until: dateOrNull(input.pucc_valid_until),
    emi_due_on: dateOrNull(input.emi_due_on),
  };
}

export function currentMonthRange(today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: toInputDate(start), end: toInputDate(end) };
}

export async function listTrucks(search?: string): Promise<Truck[]> {
  const supabase = createClient();
  return readTruckRows(async (columns) => {
    let query = supabase
      .from("trucks")
      .select(columns as typeof BASE_COLS)
      .order("registration_number", { ascending: true });
    if (search?.trim()) {
      query = query.or(
        `registration_number.ilike.%${search.trim()}%,model.ilike.%${search.trim()}%`
      );
    }
    return await query;
  });
}

export async function listActiveTrucks(search?: string): Promise<Truck[]> {
  const supabase = createClient();
  return readTruckRows(async (columns) => {
    let query = supabase
      .from("trucks")
      .select(columns as typeof BASE_COLS)
      .eq("is_active", true)
      .order("registration_number", { ascending: true })
      .limit(50);
    if (search?.trim()) {
      query = query.ilike("registration_number", `%${search.trim()}%`);
    }
    return await query;
  });
}

export async function getTruck(id: string): Promise<Truck> {
  const supabase = createClient();
  const rows = await readTruckRows(async (columns) =>
    await supabase.from("trucks").select(columns as typeof BASE_COLS).eq("id", id).limit(1)
  );
  const truck = rows[0];
  if (!truck) {
    throw new Error("Unable to load truck details.");
  }
  return truck;
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

export async function countTruckTripsThisMonth(truckId: string): Promise<number> {
  const supabase = createClient();
  const { start, end } = currentMonthRange();
  const { count, error } = await supabase
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("truck_id", truckId)
    .gte("trip_date", start)
    .lte("trip_date", end);

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to count this month's trips."));
  }
  return count ?? 0;
}

function hasPaperInput(input: Partial<TruckInput>) {
  return Boolean(
    input.registration_date ||
      input.fitness_valid_until ||
      input.tax_valid_until ||
      input.tax_is_lifetime ||
      input.insurance_valid_until ||
      input.pucc_valid_until ||
      input.emi_due_on
  );
}

export async function createTruck(input: TruckInput): Promise<Truck> {
  const supabase = createClient();
  const base = {
    registration_number: input.registration_number.toUpperCase(),
    model: input.model || null,
    status: input.status,
    is_active: input.is_active,
  };
  let result = await supabase
    .from("trucks")
    .insert(papersAvailable ? { ...base, ...paperFields(input) } : base)
    .select(truckColumns() as typeof BASE_COLS)
    .single();

  if (result.error?.code === "42703") {
    papersAvailable = false;
    if (hasPaperInput(input)) throw new Error(PAPERS_MISSING);
    result = await supabase.from("trucks").insert(base).select(BASE_COLS).single();
  }
  if (result.error) {
    throw new Error(
      getUserFacingError(
        result.error,
        "Unable to save truck. Please check the details and try again."
      )
    );
  }
  return asTruck(result.data as Truck);
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
  if (input.registration_date !== undefined) {
    Object.assign(payload, paperFields(input as TruckInput));
  }

  let result = await supabase
    .from("trucks")
    .update(payload)
    .eq("id", id)
    .select(truckColumns() as typeof BASE_COLS)
    .single();

  if (result.error?.code === "42703") {
    papersAvailable = false;
    if (hasPaperInput(input)) {
      throw new Error(PAPERS_MISSING);
    }
    result = await supabase
      .from("trucks")
      .update(payload)
      .eq("id", id)
      .select(BASE_COLS)
      .single();
  }

  if (result.error) {
    throw new Error(
      getUserFacingError(result.error, "Unable to update truck. Please try again.")
    );
  }
  return asTruck(result.data as Truck);
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
