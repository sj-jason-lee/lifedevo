-- =============================================================
-- Migration V17 — Account Deletion (Apple App Store requirement)
-- =============================================================
-- Run this in Supabase SQL Editor before submitting to App Store.
--
-- 1. Fix churches.created_by FK so deleting a user who created a
--    church does not fail (SET NULL instead of the default RESTRICT).
-- 2. Create a delete_user() RPC that authenticated users can call
--    to permanently delete their own account and all associated data.
-- =============================================================

-- -----------------------------------------------
-- 1. Fix churches.created_by foreign key
-- -----------------------------------------------

-- Make the column nullable (it may already be NOT NULL)
ALTER TABLE churches ALTER COLUMN created_by DROP NOT NULL;

-- Drop the existing FK constraint and recreate with ON DELETE SET NULL.
-- The constraint name follows Postgres's auto-naming convention:
--   churches_created_by_fkey
ALTER TABLE churches
  DROP CONSTRAINT IF EXISTS churches_created_by_fkey;

ALTER TABLE churches
  ADD CONSTRAINT churches_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- -----------------------------------------------
-- 2. Create delete_user() RPC
-- -----------------------------------------------
-- SECURITY DEFINER runs as the function owner (postgres) so it has
-- permission to delete from auth.users. The function verifies that
-- the caller is authenticated and only deletes their own row.
-- All app tables with ON DELETE CASCADE will clean up automatically.
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

-- Only authenticated users may call this function
REVOKE ALL ON FUNCTION delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
