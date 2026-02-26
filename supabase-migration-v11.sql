-- Migration v11: Devotional completions table (per-user, Supabase-backed)

CREATE TABLE devotional_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  devotional_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, devotional_id)
);

CREATE INDEX idx_devotional_completions_user_id ON devotional_completions(user_id);

ALTER TABLE devotional_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions" ON devotional_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON devotional_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON devotional_completions FOR DELETE USING (auth.uid() = user_id);
