"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { listTrucks } from "@/lib/services/trucks";
import { listCustomers } from "@/lib/services/customers";
import { listDrivers } from "@/lib/services/drivers";
import { listTrips } from "@/lib/services/trips";

interface Result {
  href: string;
  title: string;
  subtitle: string;
  group: string;
}

export function CommandSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const trucks = useQuery({
    queryKey: ["command", "trucks", debounced],
    queryFn: () => listTrucks(debounced),
    enabled: open,
  });
  const customers = useQuery({
    queryKey: ["command", "customers", debounced],
    queryFn: () => listCustomers(debounced),
    enabled: open,
  });
  const drivers = useQuery({
    queryKey: ["command", "drivers", debounced],
    queryFn: () => listDrivers(debounced),
    enabled: open,
  });
  const trips = useQuery({
    queryKey: ["command", "trips", debounced],
    queryFn: () => listTrips({ search: debounced, pageSize: 8 }),
    enabled: open,
  });

  const results = useMemo<Result[]>(() => {
    return [
      ...(trucks.data ?? []).slice(0, 5).map((truck) => ({
        href: `/dashboard/trucks/${truck.id}`,
        title: truck.registration_number,
        subtitle: truck.model ?? "Truck",
        group: "Trucks",
      })),
      ...(customers.data ?? []).slice(0, 5).map((customer) => ({
        href: `/dashboard/customers/${customer.id}`,
        title: customer.name,
        subtitle: customer.location ?? customer.phone ?? "Customer",
        group: "Customers",
      })),
      ...(drivers.data ?? []).slice(0, 5).map((driver) => ({
        href: `/dashboard/drivers/${driver.id}`,
        title: driver.name,
        subtitle: driver.phone ?? "Driver",
        group: "Drivers",
      })),
      ...(trips.data?.data ?? []).slice(0, 5).map((trip) => ({
        href: `/dashboard/trips/${trip.id}/edit`,
        title: `${trip.from_location} → ${trip.to_location}`,
        subtitle: trip.trucks?.registration_number ?? trip.trip_date,
        group: "Trips",
      })),
    ];
  }, [trucks.data, customers.data, drivers.data, trips.data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-[#070b14]/40 backdrop-blur-sm"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search records"
        className="dialog-panel relative z-10 w-full max-w-xl overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-floating)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trucks, customers, drivers, trips"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {(trucks.isLoading || customers.isLoading || drivers.isLoading || trips.isLoading) && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Searching...
            </li>
          )}
          {!trucks.isLoading &&
            !customers.isLoading &&
            !drivers.isLoading &&
            !trips.isLoading &&
            results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching records
            </li>
          )}
          {results.map((result) => (
            <li key={`${result.group}-${result.href}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left hover:bg-muted"
                onClick={() => {
                  router.push(result.href);
                  onClose();
                }}
              >
                <span>
                  <span className="block text-sm font-medium">{result.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {result.group}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
