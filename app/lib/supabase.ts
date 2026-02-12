import { createClient } from '@supabase/supabase-js';

// Access environment variables or fall back to hardcoded values (Fix for Vercel Env Var issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://weygzqesugokaolhckpq.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleWd6cWVzdWdva2FvbGhja3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDY5OTYsImV4cCI6MjA4NjQyMjk5Nn0.vBGNkGWjzMxwVYWKPohPpFF4fEmJHYDVRjCIK7Z2tvI";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
