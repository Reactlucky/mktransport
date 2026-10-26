-- One attendance row per driver per day.

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'half_day');

CREATE TABLE driver_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (driver_id, attendance_date)
);

CREATE INDEX idx_driver_attendance_date ON driver_attendance(attendance_date);

CREATE TRIGGER driver_attendance_updated_at
  BEFORE UPDATE ON driver_attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE driver_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App access for driver attendance"
  ON driver_attendance FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE driver_attendance TO anon, authenticated;
