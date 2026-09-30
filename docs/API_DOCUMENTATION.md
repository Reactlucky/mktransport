# API Documentation

## 1. Approach

V1 can use Supabase directly for standard CRUD operations instead of maintaining a separate Node/Express API.

The application should keep database access organized in service/repository modules so a dedicated backend can be introduced later if required.

## 2. Core Operations

### Trips

Create:
```text
POST /trips
```

Read:
```text
GET /trips
GET /trips/:id
```

Update:
```text
PATCH /trips/:id
```

Delete:
```text
DELETE /trips/:id
```

These are logical application operations. The initial implementation may map them to Supabase queries rather than separate HTTP route handlers.

### Trucks

```text
GET /trucks
POST /trucks
PATCH /trucks/:id
DELETE /trucks/:id
```

### Customers

```text
GET /customers
POST /customers
PATCH /customers/:id
DELETE /customers/:id
```

### Drivers

```text
GET /drivers
POST /drivers
PATCH /drivers/:id
GET /drivers/:id
```

Driver fields: name, phone, address, joining date, salary, notes, active flag.

Assignments:

```text
GET /driver-assignments?truck_id=
GET /driver-assignments?driver_id=
POST /driver-assignments        assign_driver
PATCH /driver-assignments/:id   set ended_on
```

Attendance is one status per driver per date: present, absent, leave, half_day.

Salary months snapshot gross salary. Pay entries are either `advance` or `salary_payment`. Remaining pay is never negative.

These are logical operations. The app performs them with the Supabase client in `lib/services`.

## 3. Trip Payload

Example:

```json
{
  "trip_date": "2026-09-26",
  "truck_id": "truck-uuid",
  "from_location": "Abu Road",
  "to_location": "Ahmedabad",
  "customer_id": "customer-uuid",
  "rent": 850
}
```

## 4. Validation

Required:
- trip_date
- truck_id
- from_location
- to_location
- customer_id
- rent

Rent must be a valid non-negative monetary value.

## 5. Error Handling

The UI should convert database/API errors into simple user-facing messages.

Example:

```text
Unable to save trip. Please check the required fields and try again.
```

Technical details should be logged for debugging without exposing sensitive information to users.
