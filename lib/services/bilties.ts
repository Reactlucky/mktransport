import { createClient } from "@/lib/supabase/client";
import { roundMoney } from "@/lib/calculations/builty";
import type { Builty } from "@/lib/types";
import type { BuiltyInput } from "@/lib/validations";
import { getUserFacingError } from "@/lib/utils";

function normalizeBuilty(row: Record<string, unknown>): Builty {
  return {
    id: row.id as string,
    trip_id: row.trip_id as string,
    builty_number: row.builty_number as string,
    builty_date: String(row.builty_date).slice(0, 10),
    customer_name: row.customer_name as string,
    truck_registration: row.truck_registration as string,
    from_location: row.from_location as string,
    to_location: row.to_location as string,
    goods_description: row.goods_description as string,
    package_count: Number(row.package_count),
    freight_amount: Number(row.freight_amount),
    advance_amount: Number(row.advance_amount),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getBuiltyByTrip(tripId: string): Promise<Builty | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bilties")
    .select("*")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to load the builty."));
  }
  if (!data) return null;
  return normalizeBuilty(data as Record<string, unknown>);
}

export async function saveBuilty(tripId: string, input: BuiltyInput): Promise<Builty> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bilties")
    .upsert(
      {
        trip_id: tripId,
        builty_date: input.builty_date,
        customer_name: input.customer_name,
        truck_registration: input.truck_registration,
        from_location: input.from_location,
        to_location: input.to_location,
        goods_description: input.goods_description,
        package_count: input.package_count,
        freight_amount: roundMoney(input.freight_amount),
        advance_amount: roundMoney(input.advance_amount),
      },
      { onConflict: "trip_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(getUserFacingError(error, "Unable to save the builty."));
  }
  return normalizeBuilty(data as Record<string, unknown>);
}
