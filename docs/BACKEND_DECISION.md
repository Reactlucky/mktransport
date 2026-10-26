# Backend decision

Date: 2026-10-26.

## Decision

Stay on Supabase. Do not build a Railway API or move Postgres.

This was chosen before a side-by-side latency test. A measured comparison against Next.js → Express on Railway → Postgres on Railway was not run. The remaining optimization work stays inside the current Supabase app.

## What stays

- Supabase Auth and the app session cookie
- Row Level Security policies already on the tables
- The browser client using the publishable key only
- Existing tables, columns, and migrations

## What will not be done

Phase 5B in `docs/PERFORMANCE_PLAN.md` is cancelled. No Railway schema, API, or data move will start unless that decision is reopened.

## Still open

Hosted response times, region, storage, and monthly cost were not compared. Those numbers are only needed if a move off Supabase is reconsidered.
