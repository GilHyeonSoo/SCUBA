-- SCUBA initial schema placeholder
-- Full migrations will be added when Supabase project is connected.

-- Enable PostGIS for geospatial queries (buddy, dive sites, pools)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Example: profiles table (to be implemented in Phase 2)
-- CREATE TABLE profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   nickname TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT now()
-- );
