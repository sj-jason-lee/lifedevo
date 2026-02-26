-- Migration v16: Reading plan catalog + user plan subscriptions

-- =========================================
-- 1. reading_plans — shared catalog of plans
-- =========================================
CREATE TABLE reading_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  total_days INT NOT NULL,
  days JSONB NOT NULL,  -- [{day: 1, passage: "John 1"}, ...]
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON reading_plans FOR SELECT USING (true);

-- =========================================
-- 2. user_reading_plans — which plans each user follows
-- =========================================
CREATE TABLE user_reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES reading_plans(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

CREATE INDEX idx_user_reading_plans_user ON user_reading_plans(user_id);

ALTER TABLE user_reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own" ON user_reading_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own" ON user_reading_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own" ON user_reading_plans FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- 3. Seed data — 5 popular reading plans
-- =========================================

-- Gospel of John (21 days) — matches existing plan id '1'
INSERT INTO reading_plans (id, name, description, total_days, days) VALUES (
  'gospel-of-john',
  'Gospel of John',
  'A 21-day journey through the Gospel of John',
  21,
  '[
    {"day": 1, "passage": "John 1"},
    {"day": 2, "passage": "John 2"},
    {"day": 3, "passage": "John 3"},
    {"day": 4, "passage": "John 4"},
    {"day": 5, "passage": "John 5"},
    {"day": 6, "passage": "John 6:1–40"},
    {"day": 7, "passage": "John 6:41–71"},
    {"day": 8, "passage": "John 7"},
    {"day": 9, "passage": "John 8"},
    {"day": 10, "passage": "John 9"},
    {"day": 11, "passage": "John 10"},
    {"day": 12, "passage": "John 11"},
    {"day": 13, "passage": "John 12"},
    {"day": 14, "passage": "John 13"},
    {"day": 15, "passage": "John 14"},
    {"day": 16, "passage": "John 15"},
    {"day": 17, "passage": "John 16"},
    {"day": 18, "passage": "John 17"},
    {"day": 19, "passage": "John 18"},
    {"day": 20, "passage": "John 19"},
    {"day": 21, "passage": "John 20–21"}
  ]'::jsonb
);

-- Psalms of Comfort (14 days)
INSERT INTO reading_plans (id, name, description, total_days, days) VALUES (
  'psalms-of-comfort',
  'Psalms of Comfort',
  'A 14-day journey through Psalms that bring peace and encouragement',
  14,
  '[
    {"day": 1, "passage": "Psalm 23"},
    {"day": 2, "passage": "Psalm 27"},
    {"day": 3, "passage": "Psalm 34"},
    {"day": 4, "passage": "Psalm 46"},
    {"day": 5, "passage": "Psalm 51"},
    {"day": 6, "passage": "Psalm 62"},
    {"day": 7, "passage": "Psalm 63"},
    {"day": 8, "passage": "Psalm 91"},
    {"day": 9, "passage": "Psalm 103"},
    {"day": 10, "passage": "Psalm 119:1–48"},
    {"day": 11, "passage": "Psalm 121"},
    {"day": 12, "passage": "Psalm 139"},
    {"day": 13, "passage": "Psalm 145"},
    {"day": 14, "passage": "Psalm 150"}
  ]'::jsonb
);

-- Gospel of Mark (16 days)
INSERT INTO reading_plans (id, name, description, total_days, days) VALUES (
  'gospel-of-mark',
  'Gospel of Mark',
  'A 16-day journey through the fast-paced Gospel of Mark',
  16,
  '[
    {"day": 1, "passage": "Mark 1"},
    {"day": 2, "passage": "Mark 2"},
    {"day": 3, "passage": "Mark 3"},
    {"day": 4, "passage": "Mark 4"},
    {"day": 5, "passage": "Mark 5"},
    {"day": 6, "passage": "Mark 6"},
    {"day": 7, "passage": "Mark 7"},
    {"day": 8, "passage": "Mark 8"},
    {"day": 9, "passage": "Mark 9"},
    {"day": 10, "passage": "Mark 10"},
    {"day": 11, "passage": "Mark 11"},
    {"day": 12, "passage": "Mark 12"},
    {"day": 13, "passage": "Mark 13"},
    {"day": 14, "passage": "Mark 14"},
    {"day": 15, "passage": "Mark 15"},
    {"day": 16, "passage": "Mark 16"}
  ]'::jsonb
);

-- Romans (16 days)
INSERT INTO reading_plans (id, name, description, total_days, days) VALUES (
  'romans',
  'Romans',
  'A 16-day deep dive into Paul''s letter to the Romans',
  16,
  '[
    {"day": 1, "passage": "Romans 1"},
    {"day": 2, "passage": "Romans 2"},
    {"day": 3, "passage": "Romans 3"},
    {"day": 4, "passage": "Romans 4"},
    {"day": 5, "passage": "Romans 5"},
    {"day": 6, "passage": "Romans 6"},
    {"day": 7, "passage": "Romans 7"},
    {"day": 8, "passage": "Romans 8"},
    {"day": 9, "passage": "Romans 9"},
    {"day": 10, "passage": "Romans 10"},
    {"day": 11, "passage": "Romans 11"},
    {"day": 12, "passage": "Romans 12"},
    {"day": 13, "passage": "Romans 13"},
    {"day": 14, "passage": "Romans 14"},
    {"day": 15, "passage": "Romans 15"},
    {"day": 16, "passage": "Romans 16"}
  ]'::jsonb
);

-- Sermon on the Mount (7 days)
INSERT INTO reading_plans (id, name, description, total_days, days) VALUES (
  'sermon-on-the-mount',
  'Sermon on the Mount',
  'A 7-day focused study of Jesus'' most famous sermon in Matthew 5–7',
  7,
  '[
    {"day": 1, "passage": "Matthew 5:1–16"},
    {"day": 2, "passage": "Matthew 5:17–32"},
    {"day": 3, "passage": "Matthew 5:33–48"},
    {"day": 4, "passage": "Matthew 6:1–18"},
    {"day": 5, "passage": "Matthew 6:19–34"},
    {"day": 6, "passage": "Matthew 7:1–14"},
    {"day": 7, "passage": "Matthew 7:15–29"}
  ]'::jsonb
);

-- =========================================
-- 4. Migrate existing completion data
-- =========================================
-- Old hardcoded plan used id '1', new catalog uses 'gospel-of-john'
UPDATE reading_plan_completions
  SET plan_id = 'gospel-of-john'
  WHERE plan_id = '1';
