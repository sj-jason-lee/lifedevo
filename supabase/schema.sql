-- Life Devo Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CHURCHES
-- ============================================
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_by UUID NOT NULL,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  church_id UUID REFERENCES churches(id),
  church_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'member')),
  streak_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  avatar_url TEXT,
  notification_time TEXT DEFAULT '07:00',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEVOTIONALS
-- ============================================
CREATE TABLE devotionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  scripture_ref TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  reflection TEXT NOT NULL,
  prayer_prompt TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUESTIONS (per devotional)
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- JOURNAL ENTRIES
-- ============================================
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  content TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRAYERS
-- ============================================
CREATE TABLE prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_request BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  answer_note TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  praying_count INTEGER DEFAULT 0
);

-- ============================================
-- REACTIONS
-- ============================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('journal', 'prayer')),
  target_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('praying', 'amen', 'thanks')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id, type)
);

-- ============================================
-- SHARED REFLECTIONS
-- ============================================
CREATE TABLE shared_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  scripture_ref TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  praying_count INTEGER DEFAULT 0,
  amen_count INTEGER DEFAULT 0,
  thanks_count INTEGER DEFAULT 0
);

-- ============================================
-- DEVOTIONAL COMPLETIONS
-- ============================================
CREATE TABLE devotional_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  has_journal BOOLEAN DEFAULT FALSE,
  has_prayer BOOLEAN DEFAULT FALSE,
  has_shared BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, devotional_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_completions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles in their church, update own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Churches: members can read their church
CREATE POLICY "Members can view their church"
  ON churches FOR SELECT USING (
    id IN (SELECT church_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can create a church"
  ON churches FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Devotionals: members can read published devotionals for their church
CREATE POLICY "Members can view church devotionals"
  ON devotionals FOR SELECT USING (
    church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Pastors can create devotionals"
  ON devotionals FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pastor', 'admin'))
  );

CREATE POLICY "Pastors can update own devotionals"
  ON devotionals FOR UPDATE USING (auth.uid() = author_id);

-- Questions: readable if devotional is readable
CREATE POLICY "Members can view questions"
  ON questions FOR SELECT USING (
    devotional_id IN (
      SELECT id FROM devotionals WHERE church_id IN (
        SELECT church_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Pastors can create questions"
  ON questions FOR INSERT WITH CHECK (
    devotional_id IN (SELECT id FROM devotionals WHERE author_id = auth.uid())
  );

-- Journal entries: users own their entries, shared entries visible to church
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view shared journal entries in church"
  ON journal_entries FOR SELECT USING (
    is_shared = TRUE AND
    devotional_id IN (
      SELECT id FROM devotionals WHERE church_id IN (
        SELECT church_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE USING (user_id = auth.uid());

-- Prayers: users own their prayers, shared prayers visible to church
CREATE POLICY "Users can view own prayers"
  ON prayers FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view shared prayers in church"
  ON prayers FOR SELECT USING (
    is_shared = TRUE AND
    devotional_id IN (
      SELECT id FROM devotionals WHERE church_id IN (
        SELECT church_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own prayers"
  ON prayers FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prayers"
  ON prayers FOR UPDATE USING (user_id = auth.uid());

-- Reactions: users can read all, create/delete own
CREATE POLICY "Users can view reactions"
  ON reactions FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reactions"
  ON reactions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE USING (user_id = auth.uid());

-- Shared reflections: visible to church members
CREATE POLICY "Members can view shared reflections"
  ON shared_reflections FOR SELECT USING (
    devotional_id IN (
      SELECT id FROM devotionals WHERE church_id IN (
        SELECT church_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create shared reflections"
  ON shared_reflections FOR INSERT WITH CHECK (user_id = auth.uid());

-- Completions: users own their completions
CREATE POLICY "Users can view own completions"
  ON devotional_completions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own completions"
  ON devotional_completions FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_church ON profiles(church_id);
CREATE INDEX idx_devotionals_church_status ON devotionals(church_id, status);
CREATE INDEX idx_devotionals_published ON devotionals(published_at DESC);
CREATE INDEX idx_journal_entries_user ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_devotional ON journal_entries(devotional_id);
CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_devotional ON prayers(devotional_id);
CREATE INDEX idx_completions_user ON devotional_completions(user_id);
CREATE INDEX idx_shared_reflections_devotional ON shared_reflections(devotional_id);

-- ============================================
-- AUTO-UPDATE TRIGGER for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- NOTE: Profile creation is handled by the app code (supabaseApi.ts signUp)
-- rather than a database trigger, to avoid "database error creating user"
-- issues with trigger permissions on auth.users.
