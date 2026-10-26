# Performance audit

Date: 2026-10-26. Backend stays on Supabase. No hosted latency was timed, because the Supabase logs and a production trace were not available from this session. The baseline below is request shape, not milliseconds.

## What was inspected

- `package.json`, dashboard routes, list pages, detail pages, `lib/services/*`, `lib/query-keys.ts`, `components/providers/query-provider.tsx`, and `supabase/migrations`
- Loading, empty, and error states on dashboard, trips, trucks, customers, drivers, salaries, and reports

Stack already in use: Next.js 16, React 19, TanStack Query 5, Supabase browser client. No new data library was added.

## Where time goes

Each screen talks to Supabase from the browser. With a four-truck fleet, row count is not the delay. The delay is the number of round trips and searches that fire while the user is still typing.

| Screen | Requests before this pass | What made it feel slow |
| --- | --- | --- |
| Dashboard | 5 in parallel: truck summary RPC, monthly RPC, today's trips, recent trips, full truck list | Month totals waited on the truck summary and then showed "—". Truck summary and the reminder list both loaded trucks. |
| Trips | 1 paged query plus truck and customer option lists | Search was already debounced. Filter changes replaced the list with skeletons. |
| Trucks, customers, drivers | 1 query per keystroke | Search was not debounced. |
| Salaries | 3: drivers, salary months, then pay entries | The third call waited for the month ids. |
| Reports | 3 RPCs in parallel | Changing the month cleared the previous numbers. The monthly total did not reuse the dashboard cache. |

Monthly report SQL used `EXTRACT(YEAR/MONTH FROM trip_date)`, so `idx_trips_trip_date` cannot serve those filters. That will matter more as trip history grows. It is not measurable as a wall-clock win until `008_trip_query_indexes.sql` is applied and `EXPLAIN` is run in Supabase.

## What can be measured later

- Browser network panel: dashboard request count and the slowest Supabase call
- Supabase query logs / `EXPLAIN` on `get_monthly_trip_summary`, `get_truck_wise_report`, and `get_customer_wise_report` after migration 008
- This session did not record those timings

## Changes made from this audit

See `docs/DATABASE_PERFORMANCE.md` and the ticked items in `docs/PERFORMANCE_PLAN.md`.

Request shape after the code changes, before migration 008 is applied:

| Screen | Requests |
| --- | --- |
| Dashboard | 4. The truck-status RPC is gone. Fleet counts and reminders share the truck list used by the Trucks page. |
| Trucks, customers, drivers | 1 per search, after a 300ms pause, instead of 1 per keystroke |
| Salaries | 2 in parallel. Pay entries come back with the salary months. |
| Reports | Same 3 calls. The monthly total reuses the dashboard cache for that month. |

Do not read this table as a claim that the app is a certain percent faster.
