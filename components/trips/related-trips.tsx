import Link from "next/link";
import type { Trip } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";

export function RelatedTrips({
  trips,
  isLoading,
  isError,
  onRetry,
  secondaryLabel,
  secondary,
}: {
  trips?: Trip[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  secondaryLabel: string;
  secondary: (trip: Trip) => string;
}) {
  return (
    <section aria-labelledby="related-trips-heading">
      <h2
        id="related-trips-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Trips
      </h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState message="Unable to load trip history." onRetry={onRetry} />
      )}

      {!isLoading && !isError && (trips?.length ?? 0) === 0 && (
        <p className="rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-4 py-6 text-sm text-muted-foreground">
          No trips yet.
        </p>
      )}

      {!isLoading && !isError && trips && trips.length > 0 && (
        <>
          <ul className="space-y-2 md:hidden">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/dashboard/trips/${trip.id}/edit`}
                  className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] px-4 py-3 text-sm hover:bg-muted/40"
                >
                  <span>
                    <span className="block font-medium">
                      {trip.from_location} → {trip.to_location}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(trip.trip_date)} · {secondary(trip)}
                    </span>
                  </span>
                  <span className="font-semibold">{formatCurrency(trip.rent)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-card)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">{secondaryLabel}</th>
                  <th className="px-4 py-3 font-medium text-right">Rent</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/dashboard/trips/${trip.id}/edit`}
                        className="font-medium text-primary hover:underline"
                      >
                        {formatDate(trip.trip_date)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {trip.from_location} → {trip.to_location}
                    </td>
                    <td className="px-4 py-3">{secondary(trip)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(trip.rent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
