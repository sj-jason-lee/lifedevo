import { supabase } from './supabase';
import type { CompletionStore } from '../types';
import { logger } from './logger';

export const loadCompletions = async (userId: string): Promise<CompletionStore> => {
  const { data, error } = await supabase
    .from('devotional_completions')
    .select('devotional_id, completed_at')
    .eq('user_id', userId);

  if (error || !data) {
    logger.error(error ?? 'Unknown error', 'Failed to load completions');
    return { completedIds: [], completedAt: {} };
  }

  const completedIds: string[] = [];
  const completedAt: Record<string, string> = {};

  for (const row of data) {
    completedIds.push(row.devotional_id);
    completedAt[row.devotional_id] = row.completed_at;
  }

  return { completedIds, completedAt };
};

export const toggleCompletion = async (
  userId: string,
  devotionalId: string,
  completing: boolean,
): Promise<void> => {
  if (completing) {
    const { error } = await supabase
      .from('devotional_completions')
      .insert({ user_id: userId, devotional_id: devotionalId });

    if (error) logger.error(error, 'Failed to insert completion');
  } else {
    const { error } = await supabase
      .from('devotional_completions')
      .delete()
      .eq('user_id', userId)
      .eq('devotional_id', devotionalId);

    if (error) logger.error(error, 'Failed to delete completion');
  }
};
