-- Username/password accounts stored in the app database.
-- Type a plain password when inserting a row. A trigger replaces it with a bcrypt hash.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_username_lower_idx ON users (lower(username));

COMMENT ON COLUMN users.password IS
  'Bcrypt hash. Insert the plain password; the hash_user_password trigger stores the hash.';

CREATE OR REPLACE FUNCTION hash_user_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.username = trim(NEW.username);

  IF NEW.username = '' THEN
    RAISE EXCEPTION 'Username is required';
  END IF;

  IF NEW.password IS NULL OR left(NEW.password, 4) NOT IN ('$2a$', '$2b$', '$2y$') THEN
    IF NEW.password IS NULL OR char_length(NEW.password) < 6 THEN
      RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;
    NEW.password = extensions.crypt(NEW.password, extensions.gen_salt('bf'));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER users_hash_password
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION hash_user_password();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE users FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION login_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username
  FROM users u
  WHERE lower(u.username) = lower(trim(p_username))
    AND u.password = extensions.crypt(p_password, u.password);
END;
$$;

REVOKE ALL ON FUNCTION login_user(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO anon, authenticated;

-- App data is read with the publishable key after this app's own session check.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE trucks, customers, drivers, trips TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can manage trucks" ON trucks;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage drivers" ON drivers;
DROP POLICY IF EXISTS "Authenticated users can manage trips" ON trips;

CREATE POLICY "App access for trucks"
  ON trucks FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "App access for customers"
  ON customers FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "App access for drivers"
  ON drivers FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "App access for trips"
  ON trips FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

GRANT EXECUTE ON FUNCTION get_truck_status_summary() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trip_summary(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_truck_wise_report(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_customer_wise_report(INT, INT) TO anon, authenticated;

INSERT INTO users (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;
