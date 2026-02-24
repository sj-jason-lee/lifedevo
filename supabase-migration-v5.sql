-- v5: Fix infinite recursion in church_members SELECT policy
-- The old policy referenced church_members in its own USING clause,
-- causing PostgreSQL error 42P17 (infinite recursion detected in policy).

-- 1. Create a SECURITY DEFINER function that reads church_members without RLS
CREATE OR REPLACE FUNCTION get_user_church_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT church_id FROM church_members WHERE user_id = uid;
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "church_members_select_same_church" ON church_members;

-- 3. Users can see their own membership row(s)
CREATE POLICY "church_members_select_own"
  ON church_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Users can see other members who share a church
--    Uses the SECURITY DEFINER function to avoid recursion
CREATE POLICY "church_members_select_same_church"
  ON church_members FOR SELECT
  TO authenticated
  USING (church_id IN (SELECT get_user_church_ids(auth.uid())));
