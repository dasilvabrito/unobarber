-- 1. Add commission_percentage to professionals table
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS commission_percentage numeric DEFAULT 100;

-- 2. Add products_price and professional_id to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS products_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES professionals(id);

-- 3. Create professional_payments table
CREATE TABLE IF NOT EXISTS professional_payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_slug text REFERENCES tenants(slug) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  note text
);

-- 4. Enable RLS and Policies for the new table
ALTER TABLE professional_payments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'professional_payments' AND policyname = 'Enable all access for all users'
  ) THEN
    CREATE POLICY "Enable all access for all users" ON professional_payments FOR ALL USING (true);
  END IF;
END $$;

-- 5. Reload Schema Cache (Supabase sometimes needs this)
NOTIFY pgrst, 'reload config';
