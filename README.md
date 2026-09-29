# MK Transport Management System

Simple, fast transport management for a small fleet. Built to replace notebook-based daily trip entry.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + RLS)
- Username and password accounts stored in the `users` table
- TanStack Query
- Vercel-compatible

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
AUTH_SECRET=a_long_random_string
```

`AUTH_SECRET` signs the login session cookie. Generate one with `openssl rand -base64 32`.

### 3. Database

In the Supabase SQL Editor, run in order:

1. [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) — schema, indexes, RLS, report RPCs
2. [`supabase/migrations/002_users.sql`](supabase/migrations/002_users.sql) — users table, password hashing, login function
3. [`supabase/seed.sql`](supabase/seed.sql) — sample trucks, customers, drivers, trips

### 4. Users

The users migration inserts a first account: username `admin`, password `admin123`. Change that password after you sign in.

Add more people from the Supabase table editor or SQL editor. Type the plain password in the `password` column. A trigger stores a bcrypt hash, so the saved value will not look like the password you typed.

```sql
insert into users (username, password)
values ('office', 'choose-a-password');
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## App routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/dashboard` | Operational overview |
| `/dashboard/trips` | Trip list |
| `/dashboard/trips/new` | Add trip |
| `/dashboard/trucks` | Truck management |
| `/dashboard/customers` | Customer management |
| `/dashboard/drivers` | Driver management |
| `/dashboard/reports` | Monthly reports |
| `/dashboard/settings` | Theme + logout |

## V1 scope

Daily trips (6 mandatory fields), trucks, customers, drivers (basic), dashboard, reports, light/dark mode, responsive web/mobile UI.

Out of scope for V1: EMI, GPS, payroll, expenses, WhatsApp automation.
