import { createClient } from "@/lib/supabase/client";
import type {
  CustomerWiseReport,
  MonthlyTripSummary,
  TruckStatusSummary,
  TruckWiseReport,
} from "@/lib/types";
import { getUserFacingError } from "@/lib/utils";

export async function getTruckStatusSummary(): Promise<TruckStatusSummary> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_truck_status_summary");

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load truck summary.")
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    total: Number(row?.total ?? 0),
    running: Number(row?.running ?? 0),
    available: Number(row?.available ?? 0),
    maintenance: Number(row?.maintenance ?? 0),
  };
}

export async function getMonthlyTripSummary(
  year: number,
  month: number
): Promise<MonthlyTripSummary> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_monthly_trip_summary", {
    p_year: year,
    p_month: month,
  });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load monthly summary.")
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    trip_count: Number(row?.trip_count ?? 0),
    total_rent: Number(row?.total_rent ?? 0),
  };
}

export async function getTruckWiseReport(
  year: number,
  month: number
): Promise<TruckWiseReport[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_truck_wise_report", {
    p_year: year,
    p_month: month,
  });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load truck report.")
    );
  }

  return ((data ?? []) as TruckWiseReport[]).map((row) => ({
    ...row,
    trip_count: Number(row.trip_count),
    total_rent: Number(row.total_rent),
  }));
}

export async function getCustomerWiseReport(
  year: number,
  month: number
): Promise<CustomerWiseReport[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_customer_wise_report", {
    p_year: year,
    p_month: month,
  });

  if (error) {
    throw new Error(
      getUserFacingError(error, "Unable to load customer report.")
    );
  }

  return ((data ?? []) as CustomerWiseReport[]).map((row) => ({
    ...row,
    trip_count: Number(row.trip_count),
    total_rent: Number(row.total_rent),
  }));
}
