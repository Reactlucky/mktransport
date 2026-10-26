-- Driver profile fields used by V2 driver management.
-- Existing rows keep a salary of 0 until someone edits the driver.

ALTER TABLE drivers
  ADD COLUMN address TEXT,
  ADD COLUMN joining_date DATE,
  ADD COLUMN salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN notes TEXT;

ALTER TABLE drivers
  ADD CONSTRAINT drivers_salary_non_negative CHECK (salary >= 0);
