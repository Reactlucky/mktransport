# Architecture

## 1. High-Level Architecture

```text
Browser
   |
   v
Next.js Application
   |
   +--> App session cookie
   |
   +--> Supabase PostgreSQL
   |
   +--> Supabase Storage (future)
```

## 2. Application Layers

### Presentation
Next.js pages, reusable React components and responsive UI.

### Application Logic
Client/server actions and application services for:
- Trip creation
- Truck management
- Customer management
- Dashboard calculations
- Validation

### Data Layer
Supabase PostgreSQL accessed through the Supabase client.

### Authentication
The dashboard is protected by an app session cookie (`lib/auth/session.ts`), not Supabase Auth. Accounts live in the `users` table. Supabase is the database.

## 3. Recommended Route Structure

```text
/
├── landing page
├── login
└── dashboard
    ├── trips
    ├── trucks
    ├── customers
    ├── drivers
    ├── attendance
    ├── salary
    ├── reports
    └── settings
```

Drivers, attendance, and salaries are part of the dashboard. Reports stay limited to monthly trip totals until later versions.

## 4. Core Workflow

```text
Create Customer
      |
      v
Create Truck
      |
      v
Create Daily Trip
      |
      v
Trip appears on Dashboard
      |
      v
Monthly reports calculate from trips
```

## 5. Design Architecture

The UI should use:
- A consistent design token system
- Light/Dark themes
- Reusable buttons, inputs, tables, cards and dialogs
- Transport-specific SVG/iconography
- Google-inspired clarity and color discipline without copying Google's branding or UI
- Minimal decorative effects

Avoid:
- Excessive gradients
- Excessive glassmorphism
- Generic AI dashboard patterns
- Unnecessary animations
- Large decorative cards that hide useful information
