-- Keep this installation limited to one administrator account.
DELETE FROM admins WHERE lower(email) <> 'admin@salon.com';

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
