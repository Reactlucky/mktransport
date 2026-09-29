-- MK Transport Management System — Initial Schema
-- Apply in Supabase SQL Editor or via supabase db push

-- Enums
CREATE TYPE truck_status AS ENUM ('available', 'running', 'maintenance');

-- Trucks
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  model TEXT,
  status truck_status NOT NULL DEFAULT 'available',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_date DATE NOT NULL,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  rent NUMERIC(12, 2) NOT NULL CHECK (rent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trips_trip_date ON trips(trip_date);
CREATE INDEX idx_trips_truck_id ON trips(truck_id);
CREATE INDEX idx_trips_customer_id ON trips(customer_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_trucks_registration_number ON trucks(registration_number);
CREATE INDEX idx_drivers_name ON drivers(name);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row Level Security
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage trucks"
  ON trucks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage drivers"
  ON drivers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage trips"
  ON trips FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Dashboard aggregations (RPC)
CREATE OR REPLACE FUNCTION get_truck_status_summary()
RETURNS TABLE (
  total BIGINT,
  running BIGINT,
  available BIGINT,
  maintenance BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_active)::BIGINT AS total,
    COUNT(*) FILTER (WHERE is_active AND status = 'running')::BIGINT AS running,
    COUNT(*) FILTER (WHERE is_active AND status = 'available')::BIGINT AS available,
    COUNT(*) FILTER (WHERE is_active AND status = 'maintenance')::BIGINT AS maintenance
  FROM trucks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_monthly_trip_summary(p_year INT, p_month INT)
RETURNS TABLE (
  trip_count BIGINT,
  total_rent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(rent), 0) AS total_rent
  FROM trips
  WHERE EXTRACT(YEAR FROM trip_date) = p_year
    AND EXTRACT(MONTH FROM trip_date) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_truck_wise_report(p_year INT, p_month INT)
RETURNS TABLE (
  truck_id UUID,
  registration_number TEXT,
  trip_count BIGINT,
  total_rent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.truck_id,
    tr.registration_number,
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(t.rent), 0) AS total_rent
  FROM trips t
  JOIN trucks tr ON tr.id = t.truck_id
  WHERE EXTRACT(YEAR FROM t.trip_date) = p_year
    AND EXTRACT(MONTH FROM t.trip_date) = p_month
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
BEGIN
  RETURN QUERY
  SELECT
    t.customer_id,
    c.name,
    COUNT(*)::BIGINT AS trip_count,
    COALESCE(SUM(t.rent), 0) AS total_rent
  FROM trips t
  JOIN customers c ON c.id = t.customer_id
  WHERE EXTRACT(YEAR FROM t.trip_date) = p_year
    AND EXTRACT(MONTH FROM t.trip_date) = p_month
  GROUP BY t.customer_id, c.name
  ORDER BY total_rent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_truck_status_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trip_summary(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_truck_wise_report(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_wise_report(INT, INT) TO authenticated;
