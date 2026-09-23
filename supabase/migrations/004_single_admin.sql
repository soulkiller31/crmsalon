-- Keep this installation limited to one administrator account.
DELETE FROM admins WHERE lower(email) <> 'admin@salon.com';

INSERT INTO admins (email, password_hash, name)
VALUES (
  'admin@salon.com',
  '$2a$12$j.ZzLm5j2p3E9/Q7HbaroONYBbq8afFDgT3M.F7v6mVUGzttgU7su',
  'Salon Admin'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    updated_at = NOW();

CREATE OR REPLACE FUNCTION enforce_single_salon_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(NEW.email) <> 'admin@salon.com' THEN
    RAISE EXCEPTION 'Only admin@salon.com is allowed for this installation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_salon_admin_trigger ON admins;
CREATE TRIGGER enforce_single_salon_admin_trigger
  BEFORE INSERT OR UPDATE OF email ON admins
  FOR EACH ROW EXECUTE FUNCTION enforce_single_salon_admin();
