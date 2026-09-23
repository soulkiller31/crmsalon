-- Services offered by this single-salon installation.
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  duration VARCHAR(50),
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade an older services table when it already exists.
ALTER TABLE services DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE services DROP COLUMN IF EXISTS subscription_id CASCADE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'General';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0);
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access services" ON services;
CREATE POLICY "Service role full access services" ON services FOR ALL USING (true) WITH CHECK (true);

INSERT INTO services (name, category, duration, price)
SELECT name, category, duration, price
FROM (VALUES
  ('Schwarzkopf Hairwash + Blowdry', 'Hair', '60 min', 800),
  ('O3+ Facial', 'Skin', '60 min', 2500),
  ('Party Makeup', 'Makeup', '90 min', 3000),
  ('Only Hairstyling', 'Hair', '45 min', 700),
  ('Draping', 'Styling', '30 min', 500),
  ('Face Massage', 'Skin', '30 min', 300)
) AS requested(name, category, duration, price)
WHERE NOT EXISTS (
  SELECT 1 FROM services existing WHERE lower(existing.name) = lower(requested.name)
);
