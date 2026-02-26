import type { DevotionalStatus } from '../types';

export interface ValidatableDevotional {
  title: string;
  scripture: string;
  scripture_text: string;
  body: string;
  reflect_questions: string[];
  prayer: string;
  date: string;
  status: DevotionalStatus;
  scheduled_date?: string | null;
}

export const estimateReadTime = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

export const validateDevotional = (row: ValidatableDevotional): string[] => {
  const errors: string[] = [];

  if (!row.title.trim()) errors.push('Title is required');
  if (!row.scripture.trim()) errors.push('Scripture reference is required');
  if (!row.scripture_text.trim()) errors.push('Scripture text is required');
  if (!row.body.trim()) errors.push('Devotional body is required');
  if (!row.prayer.trim()) errors.push('Prayer is required');

  const validQuestions = row.reflect_questions.filter((q) => q.trim());
  if (validQuestions.length === 0) errors.push('At least one reflection question is required');

  if (!row.date.match(/^\d{4}-\d{2}-\d{2}$/)) errors.push('Date must be YYYY-MM-DD format');

  if (row.status === 'scheduled' && row.scheduled_date) {
    if (new Date(row.scheduled_date) <= new Date()) {
      errors.push('Scheduled date must be in the future');
    }
  }

  return errors;
};
