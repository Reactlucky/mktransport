import { createClient } from "@/lib/supabase/client";
import type { DriverAssignment } from "@/lib/types";
import { getUserFacingError } from "@/lib/utils";

const ASSIGNMENT_SELECT = `
  id,
  driver_id,
  truck_id,
  started_on,
  ended_on,
  notes,
  created_at,
  updated_at,
  drivers ( id, name ),
  trucks ( id, registration_number )
`;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeAssignment(row: Record<string, unknown>): DriverAssignment {
  return {
    id: row.id as string,
    driver_id: row.driver_id as string,
    truck_id: row.truck_id as string,
    started_on: row.started_on as string,
    ended_on: (row.ended_on as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    drivers: one(
      row.drivers as DriverAssignment["drivers"] | NonNullable<DriverAssignment["drivers"]>[] | null
    ),
    trucks: one(
      row.trucks as DriverAssignment["trucks"] | NonNullable<DriverAssignment["trucks"]>[] | null
    ),
  };
}

export async function listAssignments(filter: {
  driverId?: string;
  truckId?: string;
}): Promise<DriverAssignment[]> {
  const supabase = createClient();
  let query = supabase
    .from("driver_assignments")
    .select(ASSIGNMENT_SELECT)
    .order("started_on", { ascending: false })
    .limit(30);

  if (filter.driverId) query = query.eq("driver_id", filter.driverId);
  if (filter.truckId) query = query.eq("truck_id", filter.truckId);

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load assignments. Please try again.")
    );
  }
  return ((data ?? []) as unknown[]).map((row) =>
    normalizeAssignment(row as Record<string, unknown>)
  );
}

export async function assignDriver(input: {
  truckId: string;
  driverId: string;
  startedOn: string;
  notes?: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("assign_driver", {
    p_truck_id: input.truckId,
    p_driver_id: input.driverId,
    p_started_on: input.startedOn,
    p_notes: input.notes || null,
  });

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to assign this driver. Check that both are active, and that neither already has an assignment starting later."
      )
    );
  }
}

export async function endAssignment(
  id: string,
  endedOn: string
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("driver_assignments")
    .update({ ended_on: endedOn })
    .eq("id", id)
    .is("ended_on", null)
    .select("id");

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to end this assignment. Please try again.")
    );
  }
  if (!data?.length) {
    throw new Error("This assignment is already ended.");
  }
}
