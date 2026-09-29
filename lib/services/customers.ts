import { createClient } from "@/lib/supabase/client";
import type { Customer, Trip } from "@/lib/types";
import type { CustomerInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";
import { normalizeTrips } from "@/lib/services/normalize";

const CUSTOMER_COLS =
  "id, name, phone, location, is_active, created_at, updated_at";

export async function listCustomers(search?: string): Promise<Customer[]> {
  const supabase = createClient();
  let query = supabase
    .from("customers")
    .select(CUSTOMER_COLS)
    .order("name", { ascending: true });

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%,location.ilike.%${search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load customers. Please try again.")
    );
  }
  return (data ?? []) as Customer[];
}

export async function listActiveCustomers(search?: string): Promise<Customer[]> {
  const supabase = createClient();
  let query = supabase
    .from("customers")
    .select(CUSTOMER_COLS)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(50);

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load customers. Please try again.")
    );
  }
  return (data ?? []) as Customer[];
}

export async function getCustomer(id: string): Promise<Customer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(CUSTOMER_COLS)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load customer details.")
    );
  }
  return data as Customer;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone: input.phone || null,
      location: input.location || null,
      is_active: input.is_active,
    })
    .select(CUSTOMER_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to save customer. Please check the details and try again."
      )
    );
  }
  return data as Customer;
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>
): Promise<Customer> {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone || null;
  if (input.location !== undefined) payload.location = input.location || null;
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const { data, error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select(CUSTOMER_COLS)
    .single();

  if (error) {
    throw new Error(
      getUserFacingError(
        error,
        "Unable to update customer. Please try again."
      )
    );
  }
  return data as Customer;
}

export async function getCustomerTrips(customerId: string): Promise<Trip[]> {
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
      trucks ( id, registration_number )
    `
    )
    .eq("customer_id", customerId)
    .order("trip_date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load trip history.")
    );
  }
  return normalizeTrips((data ?? []) as unknown[]);
}
