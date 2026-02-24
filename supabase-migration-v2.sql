-- Pasture App: Migration V2 — Devotionals table + role column
-- Run this in your Supabase SQL Editor AFTER migration v1

-- ============================================================
-- 1. Add role column to profiles
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'reader'
  CHECK (role IN ('reader', 'author', 'admin'));

-- ============================================================
-- 2. Create devotionals table
-- ============================================================
CREATE TABLE devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  body TEXT NOT NULL,
  reflect_questions JSONB NOT NULL DEFAULT '[]',
  prayer TEXT NOT NULL,
  date DATE NOT NULL,
  read_time_minutes INT NOT NULL DEFAULT 5,
  author_name TEXT NOT NULL,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS policies for devotionals
-- ============================================================

-- Anyone authenticated can read published devotionals with date <= today
CREATE POLICY "Anyone can read published devotionals"
  ON devotionals FOR SELECT
  USING (
    status = 'published' AND date <= CURRENT_DATE
  );

-- Authors can read their own devotionals (any status)
CREATE POLICY "Authors can read own devotionals"
  ON devotionals FOR SELECT
  USING (
    auth.uid() = author_id
  );

-- Admins can read all devotionals
CREATE POLICY "Admins can read all devotionals"
  ON devotionals FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only authors/admins can insert, must set author_id to own id
CREATE POLICY "Authors can create devotionals"
  ON devotionals FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('author', 'admin')
  );

-- Authors can update their own; admins can update any
CREATE POLICY "Authors can update own devotionals"
  ON devotionals FOR UPDATE
  USING (
    auth.uid() = author_id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can delete any; authors can delete own drafts/archived
CREATE POLICY "Authors can delete own drafts"
  ON devotionals FOR DELETE
  USING (
    (
      auth.uid() = author_id
      AND status IN ('draft', 'archived')
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- 4. Seed existing dummy devotionals
-- ============================================================
INSERT INTO devotionals (title, scripture, scripture_text, body, reflect_questions, prayer, date, read_time_minutes, author_name, author_id, status) VALUES
(
  'The Shepherd''s Voice',
  'John 10:27-28',
  'My sheep listen to my voice; I know them, and they follow me. I give them eternal life, and they shall never perish; no one will snatch them out of my hand.',
  'In the stillness of the morning, before the noise of the day floods in, there is an invitation — to listen. Not to the anxious chatter of our own minds, but to the voice of the One who knows us fully and loves us completely. Today, let us practice the art of holy listening.

The shepherd does not shout over the noise. He speaks quietly, intimately — because he knows his sheep will recognize his voice. In a culture that rewards speed and volume, this is a counter-cultural invitation. Slow down. Turn off the noise. And listen for the voice that calls you by name.

What might God be saying to you today that you''ve been too busy to hear?',
  '["What \"noise\" in your life makes it hardest to hear God''s voice?", "When was a time you clearly sensed God''s leading? What made that moment different?", "What is one practical step you can take today to create more quiet space for listening?"]',
  'Lord, in the rush of this day, slow me down. Quiet the noise — both outside and within. Help me to recognize your voice above all others, and give me the courage to follow where you lead. I trust that you know me fully, and that your hands hold me securely. Amen.',
  '2026-02-23',
  5,
  'Pastor James',
  NULL,
  'published'
),
(
  'Strength in Stillness',
  'Psalm 46:10',
  'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
  'In a world that never stops moving, God invites us to a radical act — stillness. Not the stillness of inaction, but the stillness of deep trust. It is the stillness of a child resting in a parent''s arms, knowing they are held.

Our culture tells us that productivity equals worth. But the psalmist says something shocking: be still. Stop striving. Cease fighting. And in that stillness, discover who God truly is.

Stillness is not passive — it is the most active form of faith. It says, "I trust you enough to stop trying to control the outcome."',
  '["What area of your life do you find it hardest to \"be still\" and trust God with?", "How does our culture''s obsession with busyness conflict with God''s invitation to stillness?"]',
  'Father, teach me the discipline of stillness. When my heart races with anxiety and my hands reach to control, remind me that you are God and I am not. Let me rest in your sovereignty today. Amen.',
  '2026-02-22',
  4,
  'Pastor James',
  NULL,
  'published'
),
(
  'Rooted in Love',
  'Ephesians 3:17-18',
  'So that Christ may dwell in your hearts through faith. And I pray that you, being rooted and established in love, may have power, together with all the Lord''s holy people, to grasp how wide and long and high and deep is the love of Christ.',
  'The deepest roots grow in the richest soil. And the richest soil for the human soul is love. Paul''s prayer for the Ephesians is not that they would achieve more, know more, or do more — but that they would be rooted in love.

A tree with deep roots can weather any storm. It doesn''t fear the wind because its foundation is secure. When our identity is rooted in Christ''s love rather than our own performance, we become unshakable.

Today, let the love of Christ be the ground you stand on — not your accomplishments, not others'' opinions, not your own self-assessment.',
  '["What are you most tempted to root your identity in besides God''s love?", "How does understanding the depth of Christ''s love change the way you see yourself?", "Who in your life needs to be reminded of God''s unconditional love this week?"]',
  'Jesus, plant me deep in the soil of your love. When the storms come — and they will — let me stand firm because my roots reach down into something eternal. Free me from the need to prove myself, and let your love be enough. Amen.',
  '2026-02-21',
  6,
  'Pastor Sarah',
  NULL,
  'published'
),
(
  'Walking by Faith',
  '2 Corinthians 5:7',
  'For we live by faith, not by sight.',
  'Faith is not the absence of doubt — it is the courage to move forward despite it. Paul reminds us that the Christian life is fundamentally a journey of trust, not certainty.

We live in a culture that demands proof before commitment. But faith asks us to step into the unknown, trusting that the ground will be there when our foot lands. Abraham left his homeland. Peter stepped onto the water. Mary said "yes" before she understood.

The life of faith is not a life without questions. It is a life where our trust in God is bigger than our need for answers.',
  '["Where in your life is God asking you to step forward in faith right now?", "How do you distinguish between healthy doubt and destructive unbelief?"]',
  'God of the unknown, give me the courage to walk forward even when I cannot see the path. Strengthen my faith — not by removing my questions, but by deepening my trust in your goodness. I choose to follow, even when I don''t fully understand. Amen.',
  '2026-02-20',
  5,
  'Pastor James',
  NULL,
  'published'
),
(
  'The Potter''s Hands',
  'Isaiah 64:8',
  'Yet you, Lord, are our Father. We are the clay, you are the potter; we are all the work of your hand.',
  'Surrender is not weakness. It is the bravest act of trust — placing ourselves in the Potter''s hands. The clay does not argue with the potter about its shape. It yields, trusts, and becomes.

Isaiah reminds Israel — and us — of a fundamental truth: we are not self-made. We are God-shaped. Every pressure, every turn of the wheel, every moment in the fire is part of a design we cannot yet see.

The hardest part of being clay is the waiting. The shaping takes time. The firing is hot. But the Potter''s hands are steady, skilled, and kind.',
  '["What area of your life do you find hardest to surrender to God''s shaping?", "How does viewing hardship as \"the potter''s wheel\" change your perspective on current struggles?", "What might God be forming in you through this current season?"]',
  'Father, I am the clay — you are the Potter. I surrender the parts of my life I''ve been gripping too tightly. Shape me into what you see when you look at me. Give me patience in the process and trust in your hands. Amen.',
  '2026-02-19',
  4,
  'Pastor Sarah',
  NULL,
  'published'
);
