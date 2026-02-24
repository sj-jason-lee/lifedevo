-- Fix: Add FK from church_members.user_id → profiles.id
-- Without this, PostgREST cannot resolve embedded resources like profiles(user_name)
-- in queries on church_members. Both columns reference auth.users(id) so values are
-- always compatible. This is additive and does not affect existing data.

ALTER TABLE church_members
  ADD CONSTRAINT church_members_user_id_profiles_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id);
