-- Pasture App: Supabase Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT '',
  church_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile row on signup
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared reflections
CREATE TABLE shared_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  devotional_id TEXT NOT NULL,
  devotional_title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  question_index INT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  church_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, devotional_id, question_index)
);

ALTER TABLE shared_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read church reflections"
  ON shared_reflections FOR SELECT USING (
    user_id = auth.uid()
    OR (
      church_code != ''
      AND church_code = (SELECT church_code FROM profiles WHERE id = auth.uid())
    )
  );
CREATE POLICY "Users can insert own reflections"
  ON shared_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections"
  ON shared_reflections FOR UPDATE USING (auth.uid() = user_id);
