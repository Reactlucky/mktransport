-- One builty per trip. The number is assigned on insert and left unchanged on update.
-- Trip rent and payment records are not stored or modified here.

CREATE SEQUENCE builty_number_seq AS INTEGER;

CREATE TABLE bilties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  builty_number TEXT NOT NULL UNIQUE DEFAULT (
    'MK-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
    lpad(nextval('builty_number_seq')::text, 4, '0')
  ),
  builty_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  truck_registration TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  goods_description TEXT NOT NULL,
  package_count INTEGER NOT NULL CHECK (package_count >= 0),
  freight_amount NUMERIC(12, 2) NOT NULL CHECK (freight_amount >= 0),
  advance_amount NUMERIC(12, 2) NOT NULL CHECK (advance_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (advance_amount <= freight_amount)
);

CREATE TRIGGER bilties_updated_at
  BEFORE UPDATE ON bilties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE bilties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App access for bilties"
  ON bilties FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE bilties TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE builty_number_seq TO anon, authenticated;
