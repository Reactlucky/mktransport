-- Seed data for MK Transport development/demo
-- Run after 001_initial.sql

INSERT INTO trucks (registration_number, model, status, is_active) VALUES
  ('GJ08AW0236', 'Tata 407', 'running', true),
  ('RJ38GA3610', 'Ashok Leyland', 'running', true),
  ('GJ01AB1234', 'Eicher Pro', 'available', true),
  ('RJ14CD5678', 'Mahindra Bolero', 'maintenance', true);

INSERT INTO customers (name, phone, location, is_active) VALUES
  ('SK Granite', '9876543210', 'Abu Road', true),
  ('Surya Granite', '9876543211', 'Abu Road', true);

INSERT INTO drivers (name, phone, is_active) VALUES
  ('Ramesh Kumar', '9988776655', true),
  ('Suresh Patel', '9988776656', true);

INSERT INTO trips (trip_date, truck_id, customer_id, from_location, to_location, rent)
SELECT
  '2026-09-26'::DATE,
  t.id,
  c.id,
  'Abu Road',
  'Ahmedabad',
  850
FROM trucks t, customers c
WHERE t.registration_number = 'GJ08AW0236'
  AND c.name = 'SK Granite';

INSERT INTO trips (trip_date, truck_id, customer_id, from_location, to_location, rent)
SELECT
  '2026-09-26'::DATE,
  t.id,
  c.id,
  'Abu Road',
  'Vadodara',
  900
FROM trucks t, customers c
WHERE t.registration_number = 'RJ38GA3610'
  AND c.name = 'Surya Granite';
