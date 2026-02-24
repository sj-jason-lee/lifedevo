-- ============================================================
-- Migration v4: Church-Scoped Devotionals
-- Adds church_id to devotionals and replaces SELECT/INSERT
-- RLS policies so devotionals are scoped to churches.
-- Run AFTER migration v3.
-- ============================================================

-- 1. Add church_id column
ALTER TABLE devotionals
  ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE SET NULL;

-- 2. Index for filtering by church
CREATE INDEX idx_devotionals_church_id ON devotionals(church_id);

-- 3. Drop existing SELECT and INSERT policies from v2
DROP POLICY IF EXISTS "Anyone can read published devotionals" ON devotionals;
DROP POLICY IF EXISTS "Authors can create devotionals" ON devotionals;

-- 4. New SELECT policy: church members can read published devotionals from their church
CREATE POLICY "Church members can read published devotionals"
  ON devotionals FOR SELECT
  USING (
    status = 'published'
    AND date <= CURRENT_DATE
    AND church_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM church_members
      WHERE church_members.church_id = devotionals.church_id
        AND church_members.user_id = auth.uid()
    )
  );

-- Keep "Authors can read own devotionals" (unchanged)
-- Keep "Admins can read all devotionals" (unchanged)

-- 5. New INSERT policy: author must be a leader in the target church
CREATE POLICY "Church leaders can create devotionals"
  ON devotionals FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('author', 'admin')
    AND church_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM church_members
      WHERE church_members.church_id = devotionals.church_id
        AND church_members.user_id = auth.uid()
        AND church_members.church_role = 'leader'
    )
  );

-- Keep UPDATE and DELETE policies unchanged

-- 6. Backfill: assign existing devotionals to the first available church
UPDATE devotionals
SET church_id = (SELECT id FROM churches ORDER BY created_at ASC LIMIT 1)
WHERE church_id IS NULL;
