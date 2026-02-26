-- ============================================================
-- Migration v12: Consolidate shared_reflections into user_answers
--
-- Adds sharing columns to user_answers so a single table is the
-- source of truth for both private answers and community-shared
-- reflections. Migrates existing shared_reflections data, updates
-- RLS policies, and drops the shared_reflections table.
-- Run AFTER migrations v1–v11.
-- ============================================================

-- 1. Add sharing columns to user_answers
ALTER TABLE user_answers
  ADD COLUMN shared_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN devotional_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN scripture TEXT NOT NULL DEFAULT '',
  ADD COLUMN question_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN author_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN author_initials TEXT NOT NULL DEFAULT '',
  ADD COLUMN church_code TEXT NOT NULL DEFAULT '';

-- 2. Partial index for community feed queries (only shared rows)
CREATE INDEX idx_user_answers_shared ON user_answers(church_code, shared_at)
  WHERE shared_at IS NOT NULL;

-- 3. Migrate data from shared_reflections → user_answers
--    3a. UPDATE matching rows (same user_id, devotional_id, question_index)
UPDATE user_answers ua
SET
  shared_at       = sr.created_at,
  devotional_title = sr.devotional_title,
  scripture       = sr.scripture,
  question_text   = sr.question_text,
  author_name     = sr.author_name,
  author_initials = sr.author_initials,
  church_code     = sr.church_code
FROM shared_reflections sr
WHERE ua.user_id = sr.user_id
  AND ua.devotional_id = sr.devotional_id
  AND ua.question_index = sr.question_index;

--    3b. INSERT orphaned rows (shared_reflections with no matching user_answers)
INSERT INTO user_answers (
  user_id, devotional_id, question_index, answer_text, share_flag,
  updated_at, shared_at, devotional_title, scripture,
  question_text, author_name, author_initials, church_code
)
SELECT
  sr.user_id, sr.devotional_id, sr.question_index, sr.answer_text, true,
  sr.created_at, sr.created_at, sr.devotional_title, sr.scripture,
  sr.question_text, sr.author_name, sr.author_initials, sr.church_code
FROM shared_reflections sr
WHERE NOT EXISTS (
  SELECT 1 FROM user_answers ua
  WHERE ua.user_id = sr.user_id
    AND ua.devotional_id = sr.devotional_id
    AND ua.question_index = sr.question_index
);

-- 4. Update RLS policies on user_answers
--    Drop the old owner-only SELECT policy
DROP POLICY IF EXISTS "Users can read own answers" ON user_answers;

--    4a. Own rows always visible
CREATE POLICY "Users can read own answers"
  ON user_answers FOR SELECT USING (auth.uid() = user_id);

--    4b. Shared rows visible to church members
CREATE POLICY "Users can read shared church answers"
  ON user_answers FOR SELECT USING (
    shared_at IS NOT NULL
    AND church_code != ''
    AND church_code IN (
      SELECT c.invite_code FROM churches c
      WHERE c.id IN (SELECT get_user_church_ids(auth.uid()))
    )
  );

-- INSERT/UPDATE/DELETE remain owner-only (unchanged from v10)

-- 5. Drop the shared_reflections table
DROP TABLE IF EXISTS shared_reflections;
