# MK Transport — Phased Performance Optimization Plan

Status: **In progress.** Supabase stays. Railway is cancelled. Optimization fixes from 2026-10-26 are in the app. Hosted latency is not measured yet.

Last reviewed: 2026-10-26.

## How to read tickets

- `[ ]` Not done
- `[x]` Done
- **Not in product** — the plan names a workflow the app does not have yet. Do not build it as part of this optimization work.

Do one phase at a time. Phase 5B is cancelled. Do not start a Railway migration unless this decision is reopened.

## Scope check

The plan text describes expenses, return loads, maintenance history, EMI schedules, and truck profitability. Those are future scope in `docs/DATABASE.md` and `docs/PROJECT_OVERVIEW.md`. They are not tables or screens in the app today.

What the app does have:

- Trucks, trips, customers, drivers
- Driver assignment, attendance, and pay (salary and advances)
- Truck papers and reminder dates (fitness, tax, insurance, PUC, EMI due date)
- Dashboard totals and monthly reports (trip count and rent, by truck and by customer)
- Truck status `maintenance` (a status value, not a maintenance log)

## Already in the app

These exist today. They are not completed optimization tickets. Phase 1 still has to measure whether they are enough.

- Next.js 16, React 19, TanStack Query 5, Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Shared query keys in `lib/query-keys.ts` and a default `staleTime` of 30 seconds
- Trip list pagination (`.range`) and list limits on trucks, customers, and assignments
- Debounced command search
- Skeleton, empty, and error UI in `components/ui/states.tsx`
- Indexes on trip date, trip truck, trip customer, customer name, truck registration, driver name, attendance date, assignment foreign keys, and pay period
- Automated tests: `lib/calculations/payroll.test.mts` and `lib/calculations/fleet.test.mts`
- Row Level Security and the app session cookie are already required for dashboard data

Written on 2026-10-26:

- `docs/PERFORMANCE_AUDIT.md`
- `docs/DATABASE_PERFORMANCE.md`
- `docs/BACKEND_DECISION.md`

Still missing: hosted timings, query plans, and production latency logs.

---

## Mandatory rules

- [x] Inspect the existing repository before modifying code.
- [x] Preserve existing functionality, business rules, UI design, and database relationships.
- [x] Do not migrate the backend only because the application feels slow.
- [x] Do not add a framework, state library, or data-fetching library without checking what is already installed. TanStack Query is already the data layer.
- [x] Never expose the Supabase service-role key, database credentials, or other secrets in frontend code.
- [x] Preserve authentication, authorization, RLS, and existing data integrity.
- [x] Do not delete tables, columns, migrations, or existing features during optimization.
- [x] Make small, testable changes and document every important modification.
- [x] Do not claim a performance improvement without measurements.
- [x] Do not start a major migration without presenting the findings and receiving approval.

---

## Phase 1 — Repository and performance audit

Goal: find the real bottlenecks and record a baseline. No large code changes. No backend migration.

Deliverable: `docs/PERFORMANCE_AUDIT.md` — **written**.

- [x] Inspect `package.json`, routes, components, Supabase configuration, queries, and data-fetching.
- [x] Identify slow screens and workflows.
- [x] Inspect duplicate requests, sequential requests, excessive fetching, expensive calculations, and unnecessary re-renders.
- [x] Identify where performance can be measured reliably.
- [ ] Check database query performance and available logs. SQL was reviewed. Supabase logs and `EXPLAIN` were not opened.
- [x] Record baseline measurements where possible. Request counts are in the audit. Wall-clock time was not available.
- [x] Write `docs/PERFORMANCE_AUDIT.md`.

Phase 1 exit report: see the end of this file.

---

## Phase 2 — Database optimization

Deliverable: `docs/DATABASE_PERFORMANCE.md` — **written**. Migration 008 is in the repo and still needs to be run in Supabase.

- [x] Review schema, relationships, indexes, filters, sorting, and pagination.
- [x] Identify slow or inefficient queries.
- [x] Select only required columns. Lists already selected columns. Salary entries now come back with the month row.
- [x] Add indexes only when query patterns and query plans support them. Indexes are in `008_trip_query_indexes.sql`. No `EXPLAIN` yet, and the migration is not applied on the host.
- [x] Optimize dashboard aggregations. Fleet counts use the truck list. Monthly SQL uses a date range once migration 008 is applied.
- [x] Parallelize independent requests where that is safe. Salary months and drivers load together.
- [x] Review connection pooling if it applies. The app uses the Supabase HTTP API, so no extra pool was added. The browser client is created once per tab.
- [x] Preserve RLS and database constraints.
- [x] Document proposed and completed changes in `docs/DATABASE_PERFORMANCE.md`.

Phase 2 exit report: see the end of this file.

---

## Phase 3 — Frontend optimization

- [x] Review caching and query invalidation.
- [x] Prevent unnecessary requests and repeated fetching. Truck, customer, and driver search waits 300ms. Dashboard and the Trucks page share one truck-list cache. Reports reuse the dashboard monthly total.
- [ ] Avoid unnecessary re-renders. No render profile was captured.
- [x] Add or improve skeleton loaders, empty states, error states, and retry handling. Month cards show a skeleton or Retry. Lists show “Updating…” while a new search or page loads. A top bar shows during navigation. Recent trips have an error state.
- [x] Add pagination and debounced search where measurements show they are needed. Trip pagination was already there. Debounce was added on trucks, customers, and drivers.
- [x] Optimize charts and large components only where measurements justify it. Charts are plain bars on the dashboard, reports, and salaries. No chart library was added.
- [ ] Keep mobile, tablet, and desktop layouts working. Layout structure was not redesigned. Browser check of the signed-in screens is still open.
- [x] Confirm cached data refreshes after the related writes. Creating, editing, or deleting a trip refreshes trips, dashboard, and reports.

Phase 3 exit report: see the end of this file.

---

## Phase 4 — Backend architecture decision

Deliverable: `docs/BACKEND_DECISION.md` — **written**. The user chose Supabase on 2026-10-26. A measured Railway comparison was not run.

- [ ] Response latency
- [ ] Query performance
- [ ] Hosting and database region
- [ ] Authentication requirements
- [ ] Authorization and what would replace RLS
- [ ] Storage and notifications
- [ ] Operational complexity
- [ ] Estimated monthly cost
- [ ] Migration effort and rollback risk
- [x] Write `docs/BACKEND_DECISION.md` with a recommendation
- [x] Stop and wait for approval. Approval to stay on Supabase is recorded. Railway is not approved.

Phase 4 exit report: decision recorded. Comparison tickets stay open because they were not measured.

---

## Phase 5A — Keep Supabase

Approved path. The code optimizations in this pass are applied. Full acceptance is not done.

- [x] Apply the approved optimizations.
- [x] Preserve existing auth and RLS.
- [ ] Validate all current CRUD workflows.
- [ ] Measure results against the Phase 1 baseline. Request counts are recorded. Milliseconds are not.
- [ ] Document the final architecture.

Phase 5A exit report: partial. See the end of this file.

## Phase 5B — Railway migration

**Cancelled** on 2026-10-26. These tickets will not be done unless the Supabase decision is reopened.

- [ ] Inventory tables, constraints, indexes, functions, storage, authentication, and RLS policies.
- [ ] Design the migration plan and target schema.
- [ ] Implement and secure API endpoints.
- [ ] Validate authentication and authorization.
- [ ] Migrate data with a repeatable process.
- [ ] Verify record counts, relationships, and financial calculations.
- [ ] Test in staging before production cutover.
- [ ] Keep backups and a rollback plan.
- [ ] Leave the current backend in place until acceptance tests pass.

Phase 5B exit report: not written.

---

## Phase 6 — Regression testing

- [ ] Trips, trucks, customers, and drivers
- [ ] Driver pay: salary, advances, and monthly totals
- [ ] Dashboard totals and reports
- [ ] Truck paper reminders (fitness, tax, insurance, PUC, EMI due date)
- [ ] Search, filters, pagination, and date ranges
- [x] Authentication and access restrictions. Opening `/dashboard` while signed out redirects to `/login`. Signed-in create and edit flows were not clicked through.
- [ ] Failed requests and duplicate submissions
- [ ] Responsive layouts and slow network conditions
- [ ] Expenses, payments beyond driver pay, and trip earnings — **Not in product**
- [ ] Return loads and profitability — **Not in product**
- [ ] EMI schedules and maintenance history — **Not in product** (only a due date and a truck status exist)
- [x] Add automated tests where the current test setup can hold them (`node --test` on `lib/calculations`). Fleet summary test added. `npm test` — 6 passed.

Phase 6 exit report: not complete. Only the fleet-summary test was added.

---

## Phase 7 — Deployment and monitoring

- [ ] Verify environment variables and production configuration.
- [ ] Deploy to staging before production.
- [ ] Verify backups and recovery.
- [ ] Monitor request latency, errors, slow queries, and frontend performance.
- [ ] Document deployment, rollback, and troubleshooting.

Phase 7 exit report: not written.

---

## Exit report template

Fill this in at the end of each phase. Do not mark the phase done without it.

1. Files inspected or changed.
2. Findings and root causes.
3. Changes made.
4. Tests performed and results.
5. Before-and-after measurements, or why a measurement was not possible.
6. Remaining risks.
7. Next phase, and whether approval is required.

## Approval gates

| Gate | Required before | Status |
| --- | --- | --- |
| Accept Phase 1 audit | Phase 2 | Done in the same pass. Audit is written. |
| Accept measured database and frontend changes | Phase 4 | Open. No millisecond baseline. |
| Approve Supabase retention or Railway migration | Phase 5A or 5B | Supabase approved. Railway cancelled. |

## Exit report — 2026-10-26

1. Files inspected: services, query keys, dashboard, list pages, reports, salaries, migrations `001`–`007`. Files changed: dashboard, trips, trucks, customers, drivers, reports, salaries, query client, navigation bar, `008_trip_query_indexes.sql`, fleet summary, and the docs named above.
2. Root cause: too many Supabase round trips, search-on-every-keystroke, and a salary waterfall. Month totals also used `EXTRACT`, which cannot use the trip-date index.
3. Changes: shared truck cache, debounced search, previous-page data while loading, loading bar and “Updating…”, salary entries loaded with the month, date-range SQL and indexes in migration 008.
4. Tests: `npm test` — 6 passed. `tsc --noEmit` passed. Signed-in browser flows were not completed in this pass.
5. Measurements: dashboard requests 5 → 4. Salary requests 3 sequential-ending → 2 parallel. Search no longer fires per character. No before/after milliseconds.
6. Risks: migration 008 is not applied on the host, so the index and date-range functions are not live. Monthly SQL functions remain `SECURITY DEFINER`. Render cost was not profiled.
7. Next: run `supabase/migrations/008_trip_query_indexes.sql` in the Supabase SQL editor, then check the signed-in dashboard, trips, trucks, customers, drivers, salaries, and reports. Phase 6 and Phase 7 stay open. No Railway work.
