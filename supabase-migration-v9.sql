-- ============================================================
-- Migration v9: Fix shared_reflections visibility
-- The old SELECT policy relied on profiles.church_code (a denormalized
-- field that often falls out of sync). This replaces it with a policy
-- that checks actual church membership via the church_members table,
-- reusing the get_user_church_ids() SECURITY DEFINER function from v5.
-- Run AFTER migrations v1–v8.
-- ============================================================

-- 1. Drop the old policy that relies on profiles.church_code
DROP POLICY IF EXISTS "Users can read church reflections" ON shared_reflections;

-- 2. New policy: users can see their own reflections OR reflections
--    from any church they belong to (matched via church invite_code).
CREATE POLICY "Users can read church reflections"
  ON shared_reflections FOR SELECT USING (
    user_id = auth.uid()
    OR (
      church_code != ''
      AND church_code IN (
        SELECT c.invite_code FROM churches c
        WHERE c.id IN (SELECT get_user_church_ids(auth.uid()))
      )
    )
  );

-- 3. Backfill: fix any shared_reflections rows that were saved with
--    an empty church_code because profiles.church_code was not synced.
UPDATE shared_reflections sr
SET church_code = c.invite_code
FROM church_members cm
JOIN churches c ON c.id = cm.church_id
WHERE sr.user_id = cm.user_id
  AND (sr.church_code = '' OR sr.church_code IS NULL);
