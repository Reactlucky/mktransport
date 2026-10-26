# Database performance

Date: 2026-10-26. Supabase stays. Row Level Security policies were not changed. No tables or columns were dropped.

## Queries reviewed

- Trip list: selected columns, `count: exact`, date/truck/customer filters, page size 25. Already paged.
- Dashboard monthly, truck-wise, and customer-wise reports: SQL functions in `001_initial.sql`.
- Truck list: explicit columns, with a fallback when paper columns are missing.
- Salary board: drivers, then months, then entries. The entries call waited on the month query.

Connection pooling is handled by Supabase's HTTP API. The app does not open a direct Postgres pool, so no pool setting was added. The browser client is now created once per tab instead of on every call.

## Code changes

- Dashboard fleet counts are computed from the truck list with `summarizeActiveTrucks`. That matches the old RPC rule: only active trucks, split by status. Covered by `lib/calculations/fleet.test.mts`.
- Salary months and their pay entries are one PostgREST query. Drivers still load in parallel with that query.
- Report and dashboard monthly totals share `queryKeys.dashboard.monthly(year, month)`. Saving or deleting a trip also refreshes `queryKeys.reports.all`.

## Migration to apply

`supabase/migrations/008_trip_query_indexes.sql` is in the repo. It is not applied to the hosted database by this change. Run it in the Supabase SQL editor.

It adds:

- `idx_trips_date_created` on `(trip_date DESC, created_at DESC)` for the trip list order
- `idx_trips_truck_date` on `(truck_id, trip_date DESC)`
- `idx_trips_customer_date` on `(customer_id, trip_date DESC)`

It replaces `get_monthly_trip_summary`, `get_truck_wise_report`, and `get_customer_wise_report` so they filter `trip_date` with a month range instead of `EXTRACT`. Same totals for a valid month. Invalid months return no rows. The functions stay `SECURITY DEFINER`, which is how they already bypass RLS. That was not changed.

## Not measured

No `EXPLAIN` output was captured. After the migration is applied, run `EXPLAIN` on a current-month trip summary and compare it with the previous plan before calling the database faster.
