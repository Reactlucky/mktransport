-- Demo data for 26 Sep 2026 through 26 Oct 2026.
-- Paste this into the Supabase SQL editor and run it once.
-- Requires migrations 001 through 007. It does not touch the users table.
--
-- Re-running deletes only the plates, phones, and party names listed below,
-- then inserts them again. Other trucks, drivers, and customers stay.
--
-- There is no diesel or service-history table. Pending and upcoming service
-- show up as:
--   truck status "maintenance"
--   EMI, fitness, and insurance dates on the dashboard "Coming up" list
--   assignment and pay notes that mention the diesel-pump workshop
-- Reminder dates are set for 26 Oct 2026.

BEGIN;

DELETE FROM driver_pay_entries
WHERE driver_id IN (
  SELECT id FROM drivers
  WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104', '9825011105')
);

DELETE FROM driver_salary_months
WHERE driver_id IN (
  SELECT id FROM drivers
  WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104', '9825011105')
);

DELETE FROM driver_attendance
WHERE driver_id IN (
  SELECT id FROM drivers
  WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104', '9825011105')
);

DELETE FROM driver_assignments
WHERE driver_id IN (
  SELECT id FROM drivers
  WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104', '9825011105')
)
OR truck_id IN (
  SELECT id FROM trucks
  WHERE registration_number IN (
    'RJ38GA3610', 'GJ08AW0236', 'RJ14GD5520', 'RJ01GB8834', 'GJ27T9012', 'RJ45C2219'
  )
);

DELETE FROM trips
WHERE truck_id IN (
  SELECT id FROM trucks
  WHERE registration_number IN (
    'RJ38GA3610', 'GJ08AW0236', 'RJ14GD5520', 'RJ01GB8834', 'GJ27T9012', 'RJ45C2219'
  )
)
OR customer_id IN (
  SELECT id FROM customers
  WHERE name IN (
    'SK Granite',
    'Surya Granite',
    'Ambaji Minerals',
    'Shree Marble House',
    'Beawar Stone Co',
    'Old Line Traders'
  )
);

DELETE FROM drivers
WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104', '9825011105');

DELETE FROM customers
WHERE name IN (
  'SK Granite',
  'Surya Granite',
  'Ambaji Minerals',
  'Shree Marble House',
  'Beawar Stone Co',
  'Old Line Traders'
);

DELETE FROM trucks
WHERE registration_number IN (
  'RJ38GA3610', 'GJ08AW0236', 'RJ14GD5520', 'RJ01GB8834', 'GJ27T9012', 'RJ45C2219'
);

INSERT INTO trucks (
  registration_number,
  model,
  status,
  is_active,
  registration_date,
  fitness_valid_until,
  tax_valid_until,
  tax_is_lifetime,
  insurance_valid_until,
  pucc_valid_until,
  emi_due_on
) VALUES
  (
    'RJ38GA3610', 'Tata Signa 1923', 'running', true,
    '2019-04-12', '2026-11-08', NULL, true,
    '2027-03-15', '2026-12-01', '2026-10-30'
  ),
  (
    'GJ08AW0236', 'Ashok Leyland 3118', 'running', true,
    '2020-08-03', '2026-10-26', '2026-12-31', false,
    '2026-11-18', '2026-11-02', '2026-12-05'
  ),
  (
    'RJ14GD5520', 'Eicher Pro 3019', 'running', true,
    '2018-11-19', '2027-01-20', NULL, true,
    '2026-10-18', '2026-11-25', '2026-11-15'
  ),
  (
    'RJ01GB8834', 'BharatBenz 1923', 'maintenance', true,
    '2017-06-09', '2026-10-10', '2026-11-30', false,
    '2027-06-01', '2026-10-05', '2026-10-22'
  ),
  (
    'GJ27T9012', 'Mahindra Bolero Pik-Up', 'available', true,
    '2021-02-14', '2027-02-14', NULL, true,
    '2027-04-01', '2027-01-15', '2027-01-10'
  ),
  (
    'RJ45C2219', 'Tata 1109', 'available', false,
    '2015-01-22', '2027-09-01', '2027-09-01', false,
    '2027-08-01', '2027-07-01', NULL
  );

INSERT INTO customers (name, phone, location, is_active) VALUES
  ('SK Granite', '9414012201', 'Abu Road', true),
  ('Surya Granite', '9414012202', 'Abu Road', true),
  ('Ambaji Minerals', '9414012203', 'Palanpur', true),
  ('Shree Marble House', '9414012204', 'Kishangarh', true),
  ('Beawar Stone Co', '9414012205', 'Beawar', true),
  ('Old Line Traders', '9414012206', 'Sirohi', false);

INSERT INTO drivers (name, phone, address, joining_date, salary, notes, is_active) VALUES
  (
    'Ramesh Kumar', '9825011101', 'Housing Board, Abu Road',
    '2022-03-01', 28000, 'On the Tata Signa. Diesel advance settled in the October salary.', true
  ),
  (
    'Suresh Patel', '9825011102', 'Near bus stand, Abu Road',
    '2023-01-16', 22000, 'Ashok Leyland. Full October salary paid on 6 Oct.', true
  ),
  (
    'Imran Sheikh', '9825011103', 'Riico area, Abu Road',
    '2021-07-09', 30000, 'Eicher. Took an advance on 6 Oct. Balance still open.', true
  ),
  (
    'Mahesh Lohar', '9825011104', 'Village Mount Abu Road',
    '2020-11-02', 24000, 'Came off the BharatBenz when it went for diesel-pump service.', true
  ),
  (
    'Vikram Singh', '9825011105', 'Pindwara',
    '2019-05-20', 20000, 'Left in September. Kept inactive so the driver filter has an old record.', false
  );

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-07-01', '2026-08-31', 'Earlier spell on the Bolero before the Signa.'
FROM drivers d, trucks t
WHERE d.phone = '9825011101' AND t.registration_number = 'GJ27T9012';

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-08-01', '2026-09-15', 'Last assignment before Vikram left.'
FROM drivers d, trucks t
WHERE d.phone = '9825011105' AND t.registration_number = 'GJ27T9012';

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-09-01', NULL, 'Current truck.'
FROM drivers d, trucks t
WHERE d.phone = '9825011101' AND t.registration_number = 'RJ38GA3610';

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-09-01', NULL, 'Current truck.'
FROM drivers d, trucks t
WHERE d.phone = '9825011102' AND t.registration_number = 'GJ08AW0236';

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-09-01', NULL, 'Current truck.'
FROM drivers d, trucks t
WHERE d.phone = '9825011103' AND t.registration_number = 'RJ14GD5520';

INSERT INTO driver_assignments (driver_id, truck_id, started_on, ended_on, notes)
SELECT d.id, t.id, '2026-09-01', '2026-10-20',
  'Ended when the truck went to the Abu Road workshop for diesel pump and engine service. Service still pending.'
FROM drivers d, trucks t
WHERE d.phone = '9825011104' AND t.registration_number = 'RJ01GB8834';

INSERT INTO driver_attendance (driver_id, attendance_date, status)
SELECT
  d.id,
  day::date,
  CASE
    WHEN day::date = '2026-10-03' AND d.phone = '9825011101' THEN 'half_day'::attendance_status
    WHEN day::date = '2026-10-12' AND d.phone = '9825011102' THEN 'absent'::attendance_status
    WHEN day::date = '2026-10-08' AND d.phone = '9825011103' THEN 'half_day'::attendance_status
    WHEN EXTRACT(ISODOW FROM day) = 7 AND d.phone = '9825011104' THEN 'leave'::attendance_status
    ELSE 'present'::attendance_status
  END
FROM drivers d
CROSS JOIN generate_series('2026-09-26'::date, '2026-10-26'::date, '1 day') AS day
WHERE d.phone IN ('9825011101', '9825011102', '9825011103', '9825011104');

INSERT INTO driver_attendance (driver_id, attendance_date, status)
SELECT d.id, day::date, 'present'::attendance_status
FROM drivers d
CROSS JOIN generate_series('2026-09-01'::date, '2026-09-15'::date, '1 day') AS day
WHERE d.phone = '9825011105';

INSERT INTO driver_salary_months (driver_id, year, month, gross_salary)
SELECT id, 2026, 9, salary
FROM drivers
WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104');

INSERT INTO driver_salary_months (driver_id, year, month, gross_salary)
SELECT id, 2026, 10, salary
FROM drivers
WHERE phone IN ('9825011101', '9825011102', '9825011103', '9825011104');

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'advance', 3000, '2026-09-27', 'September diesel advance'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011101';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 20000, '2026-09-30', 'September salary'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011101';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 22000, '2026-09-30', 'September salary, paid in full'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011102';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'advance', 8000, '2026-09-10', 'September advance'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011103';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 15000, '2026-09-30', 'September salary, balance left'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011103';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'advance', 2000, '2026-09-26', 'Workshop tea and diesel while BharatBenz was checked'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011104';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 20000, '2026-09-30', 'September salary'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 9
WHERE d.phone = '9825011104';

-- October money dated 6 Oct, except Ramesh's diesel advance two days earlier.
INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'advance', 5000, '2026-10-02', 'Diesel filled at Abu Road pump for RJ38GA3610'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 10
WHERE d.phone = '9825011101';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 15000, '2026-10-06', 'Salary paid on 6 Oct. ₹8,000 still to pay.'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 10
WHERE d.phone = '9825011101';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'salary_payment', 22000, '2026-10-06', 'Full salary paid on 6 Oct.'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 10
WHERE d.phone = '9825011102';

INSERT INTO driver_pay_entries (driver_id, salary_month_id, kind, amount, entry_date, notes)
SELECT d.id, m.id, 'advance', 6000, '2026-10-06', 'Advance given on 6 Oct. Salary not paid yet.'
FROM drivers d
JOIN driver_salary_months m ON m.driver_id = d.id AND m.year = 2026 AND m.month = 10
WHERE d.phone = '9825011103';

WITH days AS (
  SELECT
    gs::date AS trip_date,
    (gs::date - DATE '2026-09-26')::int AS n
  FROM generate_series(DATE '2026-09-26', DATE '2026-10-26', INTERVAL '1 day') AS gs
),
legs AS (
  SELECT *
  FROM (VALUES
    (1, 'RJ38GA3610', 'Abu Road', 'Ahmedabad', 18500, true),
    (2, 'GJ08AW0236', 'Abu Road', 'Vadodara', 16200, true),
    (3, 'RJ14GD5520', 'Kishangarh', 'Rajkot', 21400, true),
    (4, 'RJ01GB8834', 'Abu Road', 'Jaipur', 14800, false)
  ) AS v(slot, plate, origin, destination, rent, always_on)
),
planned AS (
  SELECT d.trip_date, d.n, l.slot, l.plate, l.origin, l.destination, l.rent
  FROM days d
  JOIN legs l ON l.always_on OR d.trip_date <= DATE '2026-10-20'
  UNION ALL
  SELECT d.trip_date, d.n, 5, 'GJ08AW0236', 'Vadodara', 'Abu Road', 9800
  FROM days d
  WHERE d.trip_date > DATE '2026-10-20'
  UNION ALL
  SELECT d.trip_date, d.n, 6, 'RJ38GA3610', 'Ahmedabad', 'Abu Road', 11200
  FROM days d
  WHERE d.n % 2 = 0
)
INSERT INTO trips (trip_date, truck_id, customer_id, from_location, to_location, rent)
SELECT
  p.trip_date,
  t.id,
  c.id,
  p.origin,
  p.destination,
  p.rent + (p.n % 5) * 100
FROM planned p
JOIN trucks t ON t.registration_number = p.plate
JOIN customers c ON c.name = (
  ARRAY[
    'SK Granite',
    'Surya Granite',
    'Ambaji Minerals',
    'Shree Marble House',
    'Beawar Stone Co'
  ]
)[1 + ((p.n + p.slot) % 5)];

INSERT INTO trips (trip_date, truck_id, customer_id, from_location, to_location, rent)
SELECT '2026-09-27', t.id, c.id, 'Abu Road', 'Sirohi', 6500
FROM trucks t, customers c
WHERE t.registration_number = 'GJ27T9012'
  AND c.name = 'Old Line Traders';

COMMIT;

-- What you should see on 26 Oct 2026:
-- Dashboard fleet: 5 active, 3 running, 1 available, 1 maintenance.
-- Coming up: EMI due 30 Oct, fitness due today, fitness due 8 Nov,
--   insurance due 18 Nov, insurance expired 18 Oct, fitness and EMI expired on the BharatBenz.
-- Today's trips: the 26 Oct rows.
-- Reports for October and for September (26-30 Sep only).
-- Salaries for October: payments and the advance dated 6 Oct.
-- Attendance: present, one absent, two half days, Sunday leave for Mahesh.
SELECT
  (SELECT COUNT(*) FROM trips WHERE trip_date BETWEEN '2026-09-26' AND '2026-10-26') AS trips,
  (SELECT COUNT(DISTINCT trip_date) FROM trips WHERE trip_date BETWEEN '2026-09-26' AND '2026-10-26') AS days,
  (SELECT COUNT(*) FROM drivers WHERE phone LIKE '98250111%') AS drivers,
  (SELECT COUNT(*) FROM trucks WHERE registration_number IN (
    'RJ38GA3610', 'GJ08AW0236', 'RJ14GD5520', 'RJ01GB8834', 'GJ27T9012', 'RJ45C2219'
  )) AS trucks;
