-- Create billings table
CREATE TABLE IF NOT EXISTS billings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    asaas_payment_id TEXT NOT NULL,
    invoice_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries by slug
CREATE INDEX IF NOT EXISTS idx_billings_slug ON billings(slug);

-- RLS Policies (Optional but recommended)
-- Enable RLS
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;

-- Allow read for the tenant owner
CREATE POLICY "Tenant can read own billings" ON billings
    FOR SELECT
    USING (slug = (auth.jwt() ->> 'slug'));

-- Allow insert/update only by service role (backend actions)
-- We don't create comprehensive policies here because most operations will be done via service_role client in actions.ts
