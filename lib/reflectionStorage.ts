import { supabase } from './supabase';
import type { ReflectionsStore, DevotionalAnswers, SharedReflection } from '../types';
import { logger } from './logger';

interface UserAnswerRow {
  devotional_id: string;
  question_index: number;
  answer_text: string;
  share_flag: boolean;
  shared_at: string | null;
  updated_at: string;
}

export const loadAnswers = async (
  userId: string
): Promise<ReflectionsStore> => {
  const { data, error } = await supabase
    .from('user_answers')
    .select('devotional_id, question_index, answer_text, share_flag, shared_at, updated_at')
    .eq('user_id', userId);

  if (error) {
    logger.error(error, 'Failed to load answers');
    return { answers: {} };
  }

  const answers: Record<string, DevotionalAnswers> = {};

  for (const row of (data as UserAnswerRow[]) ?? []) {
    const devId = row.devotional_id;
    if (!answers[devId]) {
      answers[devId] = {
        devotionalId: devId,
        answers: {},
        shareFlags: {},
        sharedAt: {},
        lastModified: row.updated_at,
      };
    }
    answers[devId].answers[row.question_index] = row.answer_text;
    answers[devId].shareFlags[row.question_index] = row.share_flag;
    answers[devId].sharedAt[row.question_index] = row.shared_at;

    // Track the most recent updated_at per devotional
    if (row.updated_at > answers[devId].lastModified) {
      answers[devId].lastModified = row.updated_at;
    }
  }

  return { answers };
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
    logger.error(error, 'Failed to upsert answer');
  }
};

interface ShareAnswerMeta {
  devotionalTitle: string;
  scripture: string;
  questionText: string;
  authorName: string;
  authorInitials: string;
  churchCode: string;
}

export const shareAnswer = async (
  userId: string,
  devotionalId: string,
  questionIndex: number,
  answerText: string,
  shareFlag: boolean,
  meta: ShareAnswerMeta
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
        shared_at: new Date().toISOString(),
        devotional_title: meta.devotionalTitle,
        scripture: meta.scripture,
        question_text: meta.questionText,
        author_name: meta.authorName,
        author_initials: meta.authorInitials,
        church_code: meta.churchCode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,devotional_id,question_index' }
    );

  if (error) {
    logger.error(error, 'Failed to share answer');
  }
};

interface CommunityRow {
  id: string;
  user_id: string;
  devotional_id: string;
  devotional_title: string;
  scripture: string;
  question_index: number;
  question_text: string;
  answer_text: string;
  author_name: string;
  author_initials: string;
  shared_at: string;
  church_code: string;
}

export const loadCommunityFeed = async (
  userId: string
): Promise<SharedReflection[]> => {
  const { data, error } = await supabase
    .from('user_answers')
    .select('id, user_id, devotional_id, devotional_title, scripture, question_index, question_text, answer_text, author_name, author_initials, shared_at, church_code')
    .not('shared_at', 'is', null)
    .order('shared_at', { ascending: false });

  if (error) {
    logger.error(error, 'Failed to load community feed');
    return [];
  }

  return ((data as CommunityRow[]) ?? []).map((row) => ({
    id: row.id,
    devotionalId: row.devotional_id,
    devotionalTitle: row.devotional_title,
    scripture: row.scripture,
    questionIndex: row.question_index,
    questionText: row.question_text,
    answerText: row.answer_text,
    authorName: row.author_name,
    authorInitials: row.author_initials,
    sharedAt: row.shared_at,
    isCurrentUser: row.user_id === userId,
    churchCode: row.church_code,
    userId: row.user_id,
  }));
};
