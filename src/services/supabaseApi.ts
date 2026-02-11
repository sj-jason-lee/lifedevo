import { supabase } from './supabase';
import {
  User,
  Church,
  Devotional,
  Question,
  JournalEntry,
  Prayer,
  SharedReflection,
  DevotionalCompletion,
} from '../types';

// ============================================
// Row type mappings (snake_case DB -> camelCase TS)
// ============================================

function mapProfile(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    churchId: row.church_id || '',
    churchName: row.church_name || '',
    role: row.role,
    streakCount: row.streak_count || 0,
    longestStreak: row.longest_streak || 0,
    lastActiveDate: row.last_active_date || '',
    joinedAt: row.joined_at,
    avatarUrl: row.avatar_url,
    notificationTime: row.notification_time || '07:00',
  };
}

function mapChurch(row: any): Church {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    logoUrl: row.logo_url,
    createdBy: row.created_by,
    memberCount: row.member_count || 0,
    createdAt: row.created_at,
  };
}

function mapQuestion(row: any): Question {
  return {
    id: row.id,
    devotionalId: row.devotional_id,
    text: row.text,
    order: row.order,
  };
}

function mapDevotional(row: any, questions: Question[] = []): Devotional {
  return {
    id: row.id,
    churchId: row.church_id,
    authorId: row.author_id,
    authorName: row.author_name,
    scriptureRef: row.scripture_ref,
    scriptureText: row.scripture_text,
    reflection: row.reflection,
    prayerPrompt: row.prayer_prompt,
    publishedAt: row.published_at,
    status: row.status,
    questions,
  };
}

function mapJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    devotionalId: row.devotional_id,
    questionId: row.question_id,
    content: row.content,
    isShared: row.is_shared,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPrayer(row: any): Prayer {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    devotionalId: row.devotional_id,
    content: row.content,
    isRequest: row.is_request,
    isAnswered: row.is_answered,
    answerNote: row.answer_note,
    isShared: row.is_shared,
    createdAt: row.created_at,
    prayingCount: row.praying_count || 0,
  };
}

function mapSharedReflection(row: any): SharedReflection {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    devotionalId: row.devotional_id,
    scriptureRef: row.scripture_ref,
    content: row.content,
    createdAt: row.created_at,
    reactions: {
      praying: row.praying_count || 0,
      amen: row.amen_count || 0,
      thanks: row.thanks_count || 0,
    },
  };
}

function mapCompletion(row: any): DevotionalCompletion {
  return {
    devotionalId: row.devotional_id,
    completedAt: row.completed_at,
    hasJournal: row.has_journal,
    hasPrayer: row.has_prayer,
    hasShared: row.has_shared,
  };
}

// ============================================
// AUTH
// ============================================

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ============================================
// PROFILE
// ============================================

/**
 * Ensures a profile row exists for the given auth user.
 * Creates one from auth metadata if missing (e.g. first sign-in after email confirmation).
 */
export async function ensureProfile(authUser: { id: string; email?: string; user_metadata?: any }): Promise<User | null> {
  const existing = await getProfile(authUser.id);
  if (existing) return existing;

  const name = authUser.user_metadata?.name || authUser.email || 'User';
  const email = authUser.email || '';
  const { error } = await supabase.from('profiles').upsert({
    id: authUser.id,
    name,
    email,
  });
  if (error) {
    console.warn('Profile creation error:', error.message);
    return null;
  }
  return getProfile(authUser.id);
}

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return mapProfile(data);
}

export async function updateProfile(userId: string, updates: Partial<{
  name: string;
  church_id: string;
  church_name: string;
  role: string;
  streak_count: number;
  longest_streak: number;
  last_active_date: string;
  notification_time: string;
  avatar_url: string;
}>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

// ============================================
// CHURCHES
// ============================================

export async function createChurch(name: string, userId: string): Promise<Church> {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('churches')
    .insert({ name, invite_code: inviteCode, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return mapChurch(data);
}

export async function joinChurchByCode(inviteCode: string, userId: string): Promise<Church> {
  const { data: church, error: findError } = await supabase
    .from('churches')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();
  if (findError) throw new Error('Church not found with that invite code');

  await updateProfile(userId, {
    church_id: church.id,
    church_name: church.name,
  });

  // Increment member count
  await supabase
    .from('churches')
    .update({ member_count: (church.member_count || 0) + 1 })
    .eq('id', church.id);

  return mapChurch(church);
}

export async function getChurch(churchId: string): Promise<Church | null> {
  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .eq('id', churchId)
    .single();
  if (error) return null;
  return mapChurch(data);
}

// ============================================
// DEVOTIONALS
// ============================================

export async function getDevotionals(churchId: string): Promise<Devotional[]> {
  const { data: devRows, error: devError } = await supabase
    .from('devotionals')
    .select('*')
    .eq('church_id', churchId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (devError) throw devError;
  if (!devRows || devRows.length === 0) return [];

  const devIds = devRows.map((d: any) => d.id);
  const { data: qRows } = await supabase
    .from('questions')
    .select('*')
    .in('devotional_id', devIds)
    .order('order', { ascending: true });

  const questionsByDev = new Map<string, Question[]>();
  (qRows || []).forEach((q: any) => {
    const mapped = mapQuestion(q);
    const list = questionsByDev.get(mapped.devotionalId) || [];
    list.push(mapped);
    questionsByDev.set(mapped.devotionalId, list);
  });

  return devRows.map((d: any) => mapDevotional(d, questionsByDev.get(d.id) || []));
}

export async function createDevotional(devotional: {
  church_id: string;
  author_id: string;
  author_name: string;
  scripture_ref: string;
  scripture_text: string;
  reflection: string;
  prayer_prompt: string;
  status: string;
}, questionTexts: string[]): Promise<Devotional> {
  const { data, error } = await supabase
    .from('devotionals')
    .insert({
      ...devotional,
      published_at: devotional.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  const questions: Question[] = [];
  if (questionTexts.length > 0) {
    const qRows = questionTexts.map((text, i) => ({
      devotional_id: data.id,
      text,
      order: i,
    }));
    const { data: qData, error: qError } = await supabase
      .from('questions')
      .insert(qRows)
      .select();
    if (qError) throw qError;
    (qData || []).forEach((q: any) => questions.push(mapQuestion(q)));
  }

  return mapDevotional(data, questions);
}

// ============================================
// JOURNAL ENTRIES
// ============================================

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapJournalEntry);
}

export async function upsertJournalEntry(entry: {
  user_id: string;
  devotional_id: string;
  question_id?: string;
  content: string;
  is_shared: boolean;
}): Promise<JournalEntry> {
  // Check if entry exists for this user + devotional + question
  const query = supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', entry.user_id)
    .eq('devotional_id', entry.devotional_id);

  if (entry.question_id) {
    query.eq('question_id', entry.question_id);
  } else {
    query.is('question_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ content: entry.content, is_shared: entry.is_shared })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return mapJournalEntry(data);
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return mapJournalEntry(data);
}

// ============================================
// PRAYERS
// ============================================

export async function getPrayers(userId: string): Promise<Prayer[]> {
  const { data, error } = await supabase
    .from('prayers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPrayer);
}

export async function upsertPrayer(prayer: {
  user_id: string;
  user_name: string;
  devotional_id: string;
  content: string;
  is_request: boolean;
  is_shared: boolean;
}): Promise<Prayer> {
  const { data: existing } = await supabase
    .from('prayers')
    .select('id')
    .eq('user_id', prayer.user_id)
    .eq('devotional_id', prayer.devotional_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('prayers')
      .update({
        content: prayer.content,
        is_request: prayer.is_request,
        is_shared: prayer.is_shared,
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return mapPrayer(data);
  }

  const { data, error } = await supabase
    .from('prayers')
    .insert(prayer)
    .select()
    .single();
  if (error) throw error;
  return mapPrayer(data);
}

export async function togglePrayerAnsweredApi(prayerId: string, isAnswered: boolean, answerNote?: string) {
  const { error } = await supabase
    .from('prayers')
    .update({ is_answered: isAnswered, answer_note: answerNote })
    .eq('id', prayerId);
  if (error) throw error;
}

// ============================================
// SHARED REFLECTIONS
// ============================================

export async function getSharedReflections(churchId: string): Promise<SharedReflection[]> {
  const { data: devIds } = await supabase
    .from('devotionals')
    .select('id')
    .eq('church_id', churchId);

  if (!devIds || devIds.length === 0) return [];

  const { data, error } = await supabase
    .from('shared_reflections')
    .select('*')
    .in('devotional_id', devIds.map((d: any) => d.id))
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapSharedReflection);
}

// ============================================
// COMPLETIONS
// ============================================

export async function getCompletions(userId: string): Promise<DevotionalCompletion[]> {
  const { data, error } = await supabase
    .from('devotional_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCompletion);
}

export async function createCompletion(userId: string, completion: {
  devotional_id: string;
  has_journal: boolean;
  has_prayer: boolean;
  has_shared: boolean;
}): Promise<DevotionalCompletion> {
  const { data, error } = await supabase
    .from('devotional_completions')
    .insert({ user_id: userId, ...completion })
    .select()
    .single();
  if (error) throw error;
  return mapCompletion(data);
}
