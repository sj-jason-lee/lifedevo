-- ============================================================
-- Migration v13: Auto-publish scheduled devotionals via pg_cron
--
-- Creates a function + cron job that runs every minute to flip
-- devotionals from 'scheduled' → 'published' once their
-- scheduled_date has arrived.
-- Run AFTER migrations v1–v12.
-- ============================================================

-- 1. Enable pg_cron (already available on Supabase, just needs enabling)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Grant usage so the cron job can interact with our tables
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;

-- 3. Function: publish devotionals whose scheduled_date has passed
CREATE OR REPLACE FUNCTION publish_scheduled_devotionals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs with owner privileges, bypassing RLS
SET search_path = public  -- prevent search_path injection
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE devotionals
  SET
    status     = 'published',
    updated_at = now()
  WHERE status = 'scheduled'
    AND scheduled_date IS NOT NULL
    AND scheduled_date <= now();

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$;

-- 4. Schedule the cron job: every minute
SELECT cron.schedule(
  'publish-scheduled-devotionals',   -- unique job name
  '* * * * *',                       -- every minute
  $$SELECT publish_scheduled_devotionals()$$
);
