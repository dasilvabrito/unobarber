-- Allow anonymous updates to billings (needed for webhook if using anon key)
-- CAUTION: This allows anyone to update billings if they hit the Supabase API directly. 
-- In production, Webhooks should use the SERVICE ROLE KEY and RLS should be restricted.
-- To apply this securely, ensure only the server (webhook) can call this update, but with ANON_KEY it's open.
-- For this prototype/MVP, we enable it to ensure the webhook works without SERVICE_ROLE_KEY configuration steps.

CREATE POLICY "Public update for billings" ON billings FOR UPDATE USING (true);
