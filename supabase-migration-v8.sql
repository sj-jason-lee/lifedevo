-- Migration v8: Capture Google OAuth full_name at signup
-- This ensures new users who sign up via Google get their name
-- written to the profiles table immediately, preventing "Unknown"
-- on the church members screen.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Manual fix for existing users with empty names:
-- Uncomment and run in Supabase SQL editor if needed.

-- Check which profiles have empty names:
-- SELECT p.id, p.user_name, u.email
-- FROM profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE p.user_name = '' OR p.user_name IS NULL;

-- Fix: populate from Google OAuth metadata if available:
-- UPDATE profiles p
-- SET user_name = COALESCE(u.raw_user_meta_data->>'full_name', p.user_name),
--     updated_at = now()
-- FROM auth.users u
-- WHERE u.id = p.id
--   AND (p.user_name = '' OR p.user_name IS NULL)
--   AND u.raw_user_meta_data->>'full_name' IS NOT NULL;
