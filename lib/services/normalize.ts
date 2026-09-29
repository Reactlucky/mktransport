import type { Customer, Trip, Truck } from "@/lib/types";

type NestedTruck = Pick<Truck, "id" | "registration_number"> | Pick<Truck, "id" | "registration_number">[] | null;
type NestedCustomer = Pick<Customer, "id" | "name"> | Pick<Customer, "id" | "name">[] | null;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function normalizeTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    trip_date: row.trip_date as string,
    truck_id: row.truck_id as string,
    customer_id: row.customer_id as string,
    from_location: row.from_location as string,
    to_location: row.to_location as string,
    rent: Number(row.rent),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    trucks: one(row.trucks as NestedTruck),
    customers: one(row.customers as NestedCustomer),
  };
}

export function normalizeTrips(rows: unknown[]): Trip[] {
  return (rows ?? []).map((row) => normalizeTrip(row as Record<string, unknown>));
}
