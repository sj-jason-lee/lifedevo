import { supabase } from './supabase';
import type { ReadingPlanStore } from '../types';
import { logger } from './logger';

export const load = async (userId: string): Promise<ReadingPlanStore> => {
  const { data, error } = await supabase
    .from('reading_plan_completions')
    .select('plan_id, day_number, completed_at')
    .eq('user_id', userId);

  if (error || !data) {
    logger.error(error ?? 'Unknown error', 'Failed to load reading plan completions');
    return { completedDays: {}, completedDayAt: {} };
  }

  const completedDays: Record<string, number[]> = {};
  const completedDayAt: Record<string, Record<number, string>> = {};

  for (const row of data) {
    if (!completedDays[row.plan_id]) {
      completedDays[row.plan_id] = [];
      completedDayAt[row.plan_id] = {};
    }
    completedDays[row.plan_id].push(row.day_number);
    completedDayAt[row.plan_id][row.day_number] = row.completed_at;
  }

  return { completedDays, completedDayAt };
};

export const toggleDay = async (
  userId: string,
  planId: string,
  day: number,
  completing: boolean,
): Promise<void> => {
  if (completing) {
    const { error } = await supabase
      .from('reading_plan_completions')
      .insert({ user_id: userId, plan_id: planId, day_number: day });

    if (error) logger.error(error, 'Failed to insert reading plan completion');
  } else {
    const { error } = await supabase
      .from('reading_plan_completions')
      .delete()
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .eq('day_number', day);

    if (error) logger.error(error, 'Failed to delete reading plan completion');
  }
};
