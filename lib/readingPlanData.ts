import { supabase } from './supabase';
import type { ReadingPlan, ReadingPlanDay } from '../types';
import { logger } from './logger';

interface ReadingPlanRow {
  id: string;
  name: string;
  description: string;
  total_days: number;
  days: ReadingPlanDay[];
}

const toReadingPlan = (row: ReadingPlanRow): ReadingPlan => ({
  id: row.id,
  name: row.name,
  description: row.description,
  totalDays: row.total_days,
  days: row.days,
});

export const getAllPlans = async (): Promise<ReadingPlan[]> => {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .order('total_days');

  if (error || !data) {
    logger.error(error ?? 'Unknown error', 'Failed to load reading plans');
    return [];
  }

  return (data as ReadingPlanRow[]).map(toReadingPlan);
};

export const getPlanById = async (id: string): Promise<ReadingPlan | undefined> => {
  const { data, error } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return toReadingPlan(data as ReadingPlanRow);
};

export const getPlanDay = async (
  planId: string,
  dayNumber: number,
): Promise<ReadingPlanDay | undefined> => {
  const plan = await getPlanById(planId);
  return plan?.days.find((d) => d.day === dayNumber);
};

export const getUserPlanIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_reading_plans')
    .select('plan_id')
    .eq('user_id', userId);

  if (error || !data) {
    logger.error(error ?? 'Unknown error', 'Failed to load user plan subscriptions');
    return [];
  }

  return data.map((row) => row.plan_id);
};

export const followPlan = async (userId: string, planId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_reading_plans')
    .insert({ user_id: userId, plan_id: planId });

  if (error) logger.error(error, 'Failed to follow plan');
};

export const unfollowPlan = async (userId: string, planId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_reading_plans')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);

  if (error) logger.error(error, 'Failed to unfollow plan');
};
