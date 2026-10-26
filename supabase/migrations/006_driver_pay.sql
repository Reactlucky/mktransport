-- Monthly salary snapshots and cash movements (advances and payments).
-- gross_salary is copied from the driver when the month is opened and is not rewritten later.

CREATE TABLE driver_salary_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  gross_salary NUMERIC(12, 2) NOT NULL CHECK (gross_salary >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (driver_id, year, month)
);

CREATE INDEX idx_driver_salary_months_period ON driver_salary_months(year, month);

CREATE TYPE pay_entry_kind AS ENUM ('advance', 'salary_payment');

CREATE TABLE driver_pay_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  salary_month_id UUID REFERENCES driver_salary_months(id) ON DELETE RESTRICT,
  kind pay_entry_kind NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  entry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_driver_pay_entries_month ON driver_pay_entries(salary_month_id);
CREATE INDEX idx_driver_pay_entries_driver ON driver_pay_entries(driver_id);

CREATE TRIGGER driver_salary_months_updated_at
  BEFORE UPDATE ON driver_salary_months
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER driver_pay_entries_updated_at
  BEFORE UPDATE ON driver_pay_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE driver_salary_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_pay_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App access for salary months"
  ON driver_salary_months FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "App access for pay entries"
  ON driver_pay_entries FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE driver_salary_months, driver_pay_entries TO anon, authenticated;

CREATE OR REPLACE FUNCTION open_salary_month(
  p_driver_id UUID,
  p_year INT,
  p_month INT
)
RETURNS driver_salary_months
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result driver_salary_months;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RAISE EXCEPTION 'Month must be between 1 and 12';
  END IF;

  INSERT INTO driver_salary_months (driver_id, year, month, gross_salary)
  SELECT id, p_year, p_month, salary
  FROM drivers
  WHERE id = p_driver_id
  ON CONFLICT (driver_id, year, month) DO NOTHING;

  SELECT * INTO result
  FROM driver_salary_months
  WHERE driver_id = p_driver_id
    AND year = p_year
    AND month = p_month;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Driver was not found';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION open_salary_month(UUID, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION open_salary_month(UUID, INT, INT) TO anon, authenticated;
