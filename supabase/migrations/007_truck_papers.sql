-- Vehicle papers and the next EMI date. Age is calculated from registration_date.
-- tax_is_lifetime marks lifetime tax (LTT); tax_valid_until stays empty in that case.

ALTER TABLE trucks
  ADD COLUMN IF NOT EXISTS registration_date DATE,
  ADD COLUMN IF NOT EXISTS fitness_valid_until DATE,
  ADD COLUMN IF NOT EXISTS tax_valid_until DATE,
  ADD COLUMN IF NOT EXISTS tax_is_lifetime BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_valid_until DATE,
  ADD COLUMN IF NOT EXISTS pucc_valid_until DATE,
  ADD COLUMN IF NOT EXISTS emi_due_on DATE;
