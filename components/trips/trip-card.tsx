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
    <article className="rounded-[20px] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashboard/customers/${trip.customer_id}`}
            className="font-display text-base font-semibold tracking-tight hover:text-primary"
          >
            {customer}
          </Link>
          <Link
            href={`/dashboard/trucks/${trip.truck_id}`}
            className="mt-0.5 block text-sm text-muted-foreground hover:text-primary"
          >
            {reg}
          </Link>
        </div>
        <p className="shrink-0 font-display text-lg font-semibold tabular text-primary">
          {formatCurrency(trip.rent)}
        </p>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm">
        <span className="truncate">{trip.from_location}</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-primary" aria-hidden>
          →
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="truncate text-right">{trip.to_location}</span>
      </p>
      <div className="mt-4 flex items-center justify-between">
        <time className="text-xs text-muted-foreground" dateTime={trip.trip_date}>
          {formatDate(trip.trip_date)}
        </time>
        <div className="flex gap-1">
          <Link
            href={`/dashboard/trips/${trip.id}/edit`}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit trip"
          >
            <Pencil className="size-4" />
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-danger-muted hover:text-danger"
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
