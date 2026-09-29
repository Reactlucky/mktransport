# Architecture

## 1. High-Level Architecture

```text
Browser
   |
   v
Next.js Application
   |
   +--> Supabase Auth
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
Supabase Auth handles user authentication.

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
    ├── reports
    └── settings
```

Some sections such as drivers and reports can remain hidden or limited until their V1 functionality is implemented.

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
