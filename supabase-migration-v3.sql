-- ============================================================
-- Migration v3: Church Management
-- Creates churches + church_members tables with RLS policies
-- ============================================================

-- 1. Churches table
CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Church members join table
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_role TEXT NOT NULL DEFAULT 'member' CHECK (church_role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(church_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_churches_invite_code ON churches(invite_code);
CREATE INDEX IF NOT EXISTS idx_church_members_church_id ON church_members(church_id);
CREATE INDEX IF NOT EXISTS idx_church_members_user_id ON church_members(user_id);

-- 4. Enable RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for churches

-- Any authenticated user can view churches (needed for join-by-code lookup)
CREATE POLICY "churches_select_authenticated"
  ON churches FOR SELECT
  TO authenticated
  USING (true);

-- Only authors/admins can create churches
CREATE POLICY "churches_insert_author_admin"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('author', 'admin')
    )
  );

-- Creator can update their church
CREATE POLICY "churches_update_creator"
  ON churches FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Creator can delete their church
CREATE POLICY "churches_delete_creator"
  ON churches FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 6. RLS policies for church_members

-- Members can see other members in the same church
CREATE POLICY "church_members_select_same_church"
  ON church_members FOR SELECT
  TO authenticated
  USING (
    church_id IN (
      SELECT cm.church_id FROM church_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Any authenticated user can join a church (insert themselves)
CREATE POLICY "church_members_insert_self"
  ON church_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Leaders can remove any member; members can remove themselves
CREATE POLICY "church_members_delete"
  ON church_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM church_members cm
      WHERE cm.church_id = church_members.church_id
        AND cm.user_id = auth.uid()
        AND cm.church_role = 'leader'
    )
  );
