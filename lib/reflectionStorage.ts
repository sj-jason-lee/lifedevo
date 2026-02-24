import { supabase } from './supabase';
import type { ReflectionsStore, DevotionalAnswers } from '../types';

interface UserAnswerRow {
  devotional_id: string;
  question_index: number;
  answer_text: string;
  share_flag: boolean;
  updated_at: string;
}

export const loadAnswers = async (
  userId: string
): Promise<ReflectionsStore> => {
  const { data, error } = await supabase
    .from('user_answers')
    .select('devotional_id, question_index, answer_text, share_flag, updated_at')
    .eq('user_id', userId);

  if (error) {
    console.warn('Failed to load answers:', error.message);
    return { answers: {}, sharedIds: [] };
  }

  const answers: Record<string, DevotionalAnswers> = {};

  for (const row of (data as UserAnswerRow[]) ?? []) {
    const devId = row.devotional_id;
    if (!answers[devId]) {
      answers[devId] = {
        devotionalId: devId,
        answers: {},
        shareFlags: {},
        lastModified: row.updated_at,
      };
    }
    answers[devId].answers[row.question_index] = row.answer_text;
    answers[devId].shareFlags[row.question_index] = row.share_flag;

    // Track the most recent updated_at per devotional
    if (row.updated_at > answers[devId].lastModified) {
      answers[devId].lastModified = row.updated_at;
    }
  }

  return { answers, sharedIds: [] };
};

export const upsertAnswer = async (
  userId: string,
  devotionalId: string,
  questionIndex: number,
  answerText: string,
  shareFlag: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('user_answers')
    .upsert(
      {
        user_id: userId,
        devotional_id: devotionalId,
        question_index: questionIndex,
        answer_text: answerText,
        share_flag: shareFlag,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,devotional_id,question_index' }
    );

  if (error) {
    console.warn('Failed to upsert answer:', error.message);
  }
};
