import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Trip } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

export function TripCard({
  trip,
  onDelete,
}: {
  trip: Trip;
  onDelete?: () => void;
}) {
  const reg = trip.trucks?.registration_number ?? "—";
  const customer = trip.customers?.name ?? "—";

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-wide">{reg}</p>
          <p className="mt-1 text-sm text-foreground">
            {trip.from_location} → {trip.to_location}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{customer}</p>
        </div>
        <p className="shrink-0 text-base font-semibold text-primary">
          {formatCurrency(trip.rent)}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <time className="text-xs text-muted-foreground" dateTime={trip.trip_date}>
          {formatDate(trip.trip_date)}
        </time>
        <div className="flex gap-1">
          <Link
            href={`/dashboard/trips/${trip.id}/edit`}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit trip"
          >
            <Pencil className="size-4" />
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-danger-muted hover:text-danger"
              aria-label="Delete trip"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
