-- Speed up trip lists and monthly reports.
-- Monthly functions used EXTRACT(YEAR/MONTH), which cannot use idx_trips_trip_date.
-- Apply in the Supabase SQL editor. This does not drop tables, columns, or policies.

CREATE INDEX IF NOT EXISTS idx_trips_date_created
  ON trips (trip_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trips_truck_date
  ON trips (truck_id, trip_date DESC);

CREATE INDEX IF NOT EXISTS idx_trips_customer_date
  ON trips (customer_id, trip_date DESC);

CREATE OR REPLACE FUNCTION get_monthly_trip_summary(p_year INT, p_month INT)
RETURNS TABLE (
  trip_count BIGINT,
  total_rent NUMERIC
) AS $$
DECLARE
  range_start DATE;
  range_end DATE;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RETURN;
  END IF;

  range_start := make_date(p_year, p_month, 1);
  range_end := (range_start + INTERVAL '1 month')::date;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(rent), 0) AS total_rent
  FROM trips
  WHERE trip_date >= range_start
    AND trip_date < range_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_truck_wise_report(p_year INT, p_month INT)
RETURNS TABLE (
  truck_id UUID,
  registration_number TEXT,
  trip_count BIGINT,
  total_rent NUMERIC
) AS $$
DECLARE
  range_start DATE;
  range_end DATE;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RETURN;
  END IF;

  range_start := make_date(p_year, p_month, 1);
  range_end := (range_start + INTERVAL '1 month')::date;

  RETURN QUERY
  SELECT
    t.truck_id,
    tr.registration_number,
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(t.rent), 0) AS total_rent
  FROM trips t
  JOIN trucks tr ON tr.id = t.truck_id
  WHERE t.trip_date >= range_start
    AND t.trip_date < range_end
  GROUP BY t.truck_id, tr.registration_number
  ORDER BY total_rent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_customer_wise_report(p_year INT, p_month INT)
RETURNS TABLE (
  customer_id UUID,
  name TEXT,
  trip_count BIGINT,
  total_rent NUMERIC
) AS $$
DECLARE
  range_start DATE;
  range_end DATE;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RETURN;
  END IF;

  range_start := make_date(p_year, p_month, 1);
  range_end := (range_start + INTERVAL '1 month')::date;

  RETURN QUERY
  SELECT
    t.customer_id,
    c.name,
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(t.rent), 0) AS total_rent
  FROM trips t
  JOIN customers c ON c.id = t.customer_id
  WHERE t.trip_date >= range_start
    AND t.trip_date < range_end
  GROUP BY t.customer_id, c.name
  ORDER BY total_rent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
