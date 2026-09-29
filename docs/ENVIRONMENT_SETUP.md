# Environment Setup

## 1. Prerequisites

Install:

- Node.js LTS
- npm or pnpm
- Git
- A GitHub account
- A Supabase account
- A Vercel account for deployment

## 2. Create Next.js Project

```bash
npx create-next-app@latest transport-management
cd transport-management
```

Recommended options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes

## 3. Install Supabase

```bash
npm install @supabase/supabase-js
```

## 4. Environment Variables

Create:

```text
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Never commit `.env.local`.

## 5. Supabase Setup

1. Create a new Supabase project.
2. Create the PostgreSQL tables.
3. Configure authentication.
4. Enable Row Level Security.
5. Add appropriate policies.
6. Add seed data for initial trucks and customers.

## 6. Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Deployment

Recommended deployment:

```text
GitHub → Vercel → Next.js
              |
              v
           Supabase
```

Add the production environment variables in Vercel.

## 8. Development Order

1. Create project
2. Configure Supabase
3. Create database schema
4. Add authentication
5. Build application shell
6. Build truck management
7. Build customer management
8. Build daily trip entry
9. Build dashboard
10. Add reports
11. Add future modules incrementally
