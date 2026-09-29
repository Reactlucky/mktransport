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

## 4. Future Tables

These should be added when the relevant features are implemented:

```text
drivers
driver_assignments
driver_attendance
driver_salary_transactions
truck_emi
truck_services
truck_maintenance
truck_documents
trip_expenses
trip_payments
return_loads
reminders
```

## 5. Important Design Rule

Do not put every possible business field into the trips table.

For example:
- Customer details belong in customers.
- Truck details belong in trucks.
- Driver details belong in drivers.
- Maintenance belongs in maintenance/service tables.

Trips should primarily represent a transport movement and its financial basics.

## 6. Example Data

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

## 7. Security

Supabase Row Level Security must be enabled.

The authenticated business user should only access records they are authorized to access.

Never rely only on frontend restrictions for security.
