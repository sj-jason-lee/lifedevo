-- v14: Allow leaders to update member roles within their church
CREATE POLICY "church_members_update_leader"
  ON church_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.church_id = church_members.church_id
        AND cm.user_id = auth.uid()
        AND cm.church_role = 'leader'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.church_id = church_members.church_id
        AND cm.user_id = auth.uid()
        AND cm.church_role = 'leader'
    )
  );
