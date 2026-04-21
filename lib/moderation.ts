import { supabase } from './supabase';

/**
 * Report a reflection for review.
 */
export const reportReflection = async (
  reporterUserId: string,
  reportedUserId: string,
  reflectionId: string,
  reason: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('user_reports').insert({
    reporter_user_id: reporterUserId,
    reported_user_id: reportedUserId,
    reflection_id: reflectionId,
    reason,
  });
  return { error: error?.message ?? null };
};

/**
 * Block a user so their reflections are hidden from the blocker's feed.
 */
export const blockUser = async (
  blockerUserId: string,
  blockedUserId: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('user_blocks').insert({
    blocker_user_id: blockerUserId,
    blocked_user_id: blockedUserId,
  });
  return { error: error?.message ?? null };
};

/**
 * Unblock a previously blocked user.
 */
export const unblockUser = async (
  blockerUserId: string,
  blockedUserId: string
): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_user_id', blockerUserId)
    .eq('blocked_user_id', blockedUserId);
  return { error: error?.message ?? null };
};

/**
 * Load the list of user IDs that the current user has blocked.
 */
export const loadBlockedUsers = async (
  userId: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_user_id')
    .eq('blocker_user_id', userId);
  if (error || !data) return [];
  return data.map((row) => row.blocked_user_id);
};
