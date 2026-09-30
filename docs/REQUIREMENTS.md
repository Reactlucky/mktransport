# Requirements

## 1. V1 Functional Requirements

### 1.1 Authentication
- User can log in securely.
- Only authenticated users can access business data.
- Business data must not be publicly accessible.

### 1.2 Dashboard
The dashboard should provide a quick operational overview:
- Total trucks
- Running trucks
- Available trucks
- Maintenance trucks
- Today's trips
- Current month's trip count
- Current month's total rent
- Recent trips
- Upcoming reminders when reminder functionality is introduced

The dashboard should prioritize useful information over excessive charts.

### 1.3 Daily Trips

A user can create, view, edit and delete a trip.

#### Mandatory fields
- Date
- Truck
- From
- To
- Customer
- Rent

#### Optional fields for future
- Driver
- Return load
- Advance
- Payment status
- Diesel
- Toll
- Other expenses
- Notes
- Expected return date
- Trip status

### 1.4 Trucks

Each truck should have:
- Registration number
- Basic truck details
- Active/inactive status

Future truck details:
- Purchase information
- EMI
- Insurance
- Fitness
- PUC
- Service history
- Tyre history
- Repair history
- Total maintenance cost

### 1.5 Customers

Customer records should contain:
- Customer/party name
- Phone number
- Location
- Active/inactive status

Future:
- GST details
- Trip history
- Total business
- Pending payments
- Previous rates

### 1.6 Drivers

A driver record stores:

- Name
- Phone
- Address
- Joining date
- Monthly salary
- Notes
- Active/inactive status

The app can assign a driver to a truck, keep assignment history, mark daily attendance, and record salary payments and advances against a month.

## 2. UX Requirements

- Adding a trip should take as few actions as practical.
- Truck and customer should be selectable from existing records.
- Avoid repeated typing.
- Forms should clearly indicate required fields.
- Provide useful validation messages.
- Confirm destructive actions.
- Use readable tables on desktop.
- Use responsive cards/forms on smaller screens.
- Support Light and Dark mode.
- Use consistent icons and transport-related SVG illustrations.

## 3. Non-Functional Requirements

### Performance
- Fast initial dashboard load.
- Avoid unnecessary database requests.
- Use pagination for growing tables.

### Security
- The dashboard requires the app session cookie. Database access uses the Supabase publishable key with Row Level Security.
- Never expose service-role credentials in frontend code.
- Validate user input.

### Maintainability
- TypeScript throughout the application.
- Reusable components.
- Clear database relationships.
- Business logic should not be duplicated across pages.

## 4. Out of Scope for V1

Do not block the first release on:
- GPS tracking
- Automated WhatsApp messages
- Complex accounting
- Advanced payroll
- Full invoicing
- Driver mobile application
- Real-time vehicle telemetry
