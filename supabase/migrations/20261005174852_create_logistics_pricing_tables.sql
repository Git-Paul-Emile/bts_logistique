/*
# Create logistics pricing tables

1. New Tables
- `pricing_settings` stores the shared coefficient tarifaire used for new parcel calculations.
- `quote_calculations` stores the parcel details and final price displayed in the dashboard history.
2. Columns
- pricing_settings: id, coefficient, updated_at.
- quote_calculations: id, recipient_name, destination, length_cm, width_cm, height_cm, weight_kg, cubic_meter, coefficient, final_price, created_at.
3. Security
- Row level security is enabled on both shared single-tenant tables.
- Four explicit CRUD policies allow the anonymous dashboard to use the shared workspace.
4. Important notes
- The initial coefficient is 8.50 EUR per cubic meter.
- The stored coefficient on each calculation preserves the price context at the time of calculation.
*/

CREATE TABLE IF NOT EXISTS pricing_settings (
  id integer PRIMARY KEY DEFAULT 1,
  coefficient numeric(10, 2) NOT NULL DEFAULT 8.50 CHECK (coefficient > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name text NOT NULL,
  destination text NOT NULL,
  length_cm numeric(10, 2) NOT NULL CHECK (length_cm > 0),
  width_cm numeric(10, 2) NOT NULL CHECK (width_cm > 0),
  height_cm numeric(10, 2) NOT NULL CHECK (height_cm > 0),
  weight_kg numeric(10, 2) NOT NULL CHECK (weight_kg > 0),
  cubic_meter numeric(12, 6) NOT NULL CHECK (cubic_meter > 0),
  coefficient numeric(10, 2) NOT NULL CHECK (coefficient > 0),
  final_price numeric(12, 2) NOT NULL CHECK (final_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO pricing_settings (id, coefficient)
VALUES (1, 8.50)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read pricing settings" ON pricing_settings;
CREATE POLICY "Public can read pricing settings" ON pricing_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can insert pricing settings" ON pricing_settings;
CREATE POLICY "Public can insert pricing settings" ON pricing_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update pricing settings" ON pricing_settings;
CREATE POLICY "Public can update pricing settings" ON pricing_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete pricing settings" ON pricing_settings;
CREATE POLICY "Public can delete pricing settings" ON pricing_settings FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read quote calculations" ON quote_calculations;
CREATE POLICY "Public can read quote calculations" ON quote_calculations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can insert quote calculations" ON quote_calculations;
CREATE POLICY "Public can insert quote calculations" ON quote_calculations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update quote calculations" ON quote_calculations;
CREATE POLICY "Public can update quote calculations" ON quote_calculations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete quote calculations" ON quote_calculations;
CREATE POLICY "Public can delete quote calculations" ON quote_calculations FOR DELETE TO anon, authenticated USING (true);