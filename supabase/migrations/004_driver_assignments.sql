-- Truck and driver assignment history.
-- An open assignment has ended_on null.
-- A truck and a driver can each have only one open assignment.

CREATE TABLE driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE RESTRICT,
  started_on DATE NOT NULL,
  ended_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT driver_assignments_dates CHECK (ended_on IS NULL OR ended_on >= started_on)
);

CREATE INDEX idx_driver_assignments_driver_id ON driver_assignments(driver_id);
CREATE INDEX idx_driver_assignments_truck_id ON driver_assignments(truck_id);

CREATE UNIQUE INDEX driver_assignments_one_open_truck
  ON driver_assignments (truck_id)
  WHERE ended_on IS NULL;

CREATE UNIQUE INDEX driver_assignments_one_open_driver
  ON driver_assignments (driver_id)
  WHERE ended_on IS NULL;

CREATE TRIGGER driver_assignments_updated_at
  BEFORE UPDATE ON driver_assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App access for driver assignments"
  ON driver_assignments FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE driver_assignments TO anon, authenticated;

-- Ends any open assignment that would conflict, then inserts the new one.
CREATE OR REPLACE FUNCTION assign_driver(
  p_truck_id UUID,
  p_driver_id UUID,
  p_started_on DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS driver_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result driver_assignments;
BEGIN
  IF p_started_on IS NULL THEN
    RAISE EXCEPTION 'Start date is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM trucks WHERE id = p_truck_id AND is_active) THEN
    RAISE EXCEPTION 'Select an active truck';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = p_driver_id AND is_active) THEN
    RAISE EXCEPTION 'Select an active driver';
  END IF;

  UPDATE driver_assignments
  SET ended_on = p_started_on
  WHERE truck_id = p_truck_id
    AND ended_on IS NULL
    AND started_on <= p_started_on;

  IF EXISTS (
    SELECT 1 FROM driver_assignments
    WHERE truck_id = p_truck_id AND ended_on IS NULL
  ) THEN
    RAISE EXCEPTION 'This truck already has an assignment that starts later';
  END IF;

  UPDATE driver_assignments
  SET ended_on = p_started_on
  WHERE driver_id = p_driver_id
    AND ended_on IS NULL
    AND started_on <= p_started_on;

  IF EXISTS (
    SELECT 1 FROM driver_assignments
    WHERE driver_id = p_driver_id AND ended_on IS NULL
  ) THEN
    RAISE EXCEPTION 'This driver already has an assignment that starts later';
  END IF;

  INSERT INTO driver_assignments (driver_id, truck_id, started_on, notes)
  VALUES (p_driver_id, p_truck_id, p_started_on, NULLIF(btrim(COALESCE(p_notes, '')), ''))
  RETURNING * INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION assign_driver(UUID, UUID, DATE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assign_driver(UUID, UUID, DATE, TEXT) TO anon, authenticated;
