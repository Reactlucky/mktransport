import type { Truck, TruckStatusSummary } from "@/lib/types";

export function summarizeActiveTrucks(
  trucks: Pick<Truck, "is_active" | "status">[]
): TruckStatusSummary {
  const summary: TruckStatusSummary = {
    total: 0,
    running: 0,
    available: 0,
    maintenance: 0,
  };

  for (const truck of trucks) {
    if (!truck.is_active) continue;
    summary.total += 1;
    if (truck.status === "running") summary.running += 1;
    else if (truck.status === "available") summary.available += 1;
    else if (truck.status === "maintenance") summary.maintenance += 1;
  }

  return summary;
}
