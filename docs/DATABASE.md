# Database

## 1. Database

Database: PostgreSQL through Supabase.

The schema should be designed around master data and transactions.

## 2. V1 Tables

### trucks

```text
id
registration_number
name/model (optional)
is_active
registration_date
fitness_valid_until
tax_valid_until
tax_is_lifetime (LTT when true)
insurance_valid_until
pucc_valid_until
emi_due_on
created_at
updated_at
```

### customers

```text
id
name
phone
location (optional)
is_active
created_at
updated_at
```

### trips

```text
id
trip_date
truck_id
customer_id
from_location
to_location
rent
created_at
updated_at
```

## 3. Relationships

```text
trucks 1 ---- * trips
customers 1 ---- * trips
```

A truck can have many trips.

A customer can have many trips.

Each trip belongs to one truck and one customer.

Drivers are separate from trips. A truck's driver comes from `driver_assignments`, not from a column on the truck or the trip.

## 4. V2 Tables

Migrations `003` through `006`. Apply them after `001` and `002`.

### drivers

Existing columns, plus:

```text
address
joining_date
salary          numeric(12,2), never negative
notes
```

### driver_assignments

```text
id
driver_id
truck_id
started_on
ended_on        null while the assignment is current
notes
created_at
updated_at
```

One open assignment per truck and one open assignment per driver. `assign_driver` ends the conflicting open rows, then inserts the new one.

### driver_attendance

One row per driver per date. Status is `present`, `absent`, `leave`, or `half_day`.

### driver_salary_months

```text
driver_id
year
month
gross_salary    copied from the driver when the month is opened
```

`open_salary_month` creates the row once. Later changes to the driver's salary do not rewrite it.

### driver_pay_entries

```text
driver_id
salary_month_id
kind            advance or salary_payment
amount          greater than 0
entry_date
notes
```

Remaining salary is gross minus advances minus payments, and it is never shown below zero.

## 5. Later Tables

```text
truck_emi
truck_services
truck_maintenance
truck_documents
trip_expenses
trip_payments
return_loads
reminders
```

## 6. Important Design Rule

Do not put every possible business field into the trips table.

For example:
- Customer details belong in customers.
- Truck details belong in trucks.
- Driver details belong in drivers.
- Maintenance belongs in maintenance/service tables.

Trips should primarily represent a transport movement and its financial basics.

## 7. Example Data

### Trip 1

```text
date: 2026-09-26
truck: GJ08AW0236
from: Abu Road
to: Ahmedabad
customer: SK Granite
rent: 850
```

### Trip 2

```text
date: 2026-09-26
truck: RJ38GA3610
from: Abu Road
to: Vadodara
customer: Surya Granite
rent: 900
```

## 8. Security

Supabase Row Level Security must be enabled.

The app checks its own session cookie before dashboard pages load. Database policies still allow the publishable key to read and write business tables, matching migration `002_users.sql`. New tables use that same policy. Do not put a service-role key in frontend code.
