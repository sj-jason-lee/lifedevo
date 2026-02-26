-- Reading plan completions (mirrors devotional_completions from v11)
CREATE TABLE reading_plan_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  day_number INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id, day_number)
);

CREATE INDEX idx_reading_plan_completions_user
  ON reading_plan_completions(user_id);

ALTER TABLE reading_plan_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reading plan completions"
  ON reading_plan_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading plan completions"
  ON reading_plan_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading plan completions"
  ON reading_plan_completions FOR DELETE USING (auth.uid() = user_id);
