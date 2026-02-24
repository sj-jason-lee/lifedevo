-- Fix: Church showing 0 members due to profiles RLS blocking INNER JOIN
-- Allow users to read profiles of members who share a church with them.
-- Reuses the existing get_user_church_ids() SECURITY DEFINER function from v5.
-- Multiple SELECT policies on the same table are OR-combined in PostgreSQL,
-- so the existing "Users can read own profile" policy still covers self-reads.

CREATE POLICY "church_members_can_read_fellow_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cm.user_id FROM church_members cm
      WHERE cm.church_id IN (SELECT get_user_church_ids(auth.uid()))
    )
  );
