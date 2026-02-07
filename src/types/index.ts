export type UserRole = 'admin' | 'pastor' | 'member';
export type DevotionalStatus = 'draft' | 'scheduled' | 'published';
export type ReactionType = 'praying' | 'amen' | 'thanks';

export interface Church {
  id: string;
  name: string;
  inviteCode: string;
  logoUrl?: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  churchId: string;
  churchName: string;
  role: UserRole;
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string;
  joinedAt: string;
  avatarUrl?: string;
  notificationTime: string; // e.g., "07:00"
}

export interface Devotional {
  id: string;
  churchId: string;
  authorId: string;
  authorName: string;
  scriptureRef: string;
  scriptureText: string;
  reflection: string;
  prayerPrompt: string;
  publishedAt: string;
  status: DevotionalStatus;
  questions: Question[];
}

export interface Question {
  id: string;
  devotionalId: string;
  text: string;
  order: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  devotionalId: string;
  questionId?: string;
  content: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prayer {
  id: string;
  userId: string;
  userName: string;
  devotionalId: string;
  content: string;
  isRequest: boolean;
  isAnswered: boolean;
  answerNote?: string;
  isShared: boolean;
  createdAt: string;
  prayingCount: number;
}

export interface Reaction {
  id: string;
  userId: string;
  targetType: 'journal' | 'prayer';
  targetId: string;
  type: ReactionType;
  createdAt: string;
}

export interface SharedReflection {
  id: string;
  userId: string;
  userName: string;
  devotionalId: string;
  scriptureRef: string;
  content: string;
  createdAt: string;
  reactions: { praying: number; amen: number; thanks: number };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
  lastCompletedDate: string;
  milestones: number[];
}

export interface DevotionalCompletion {
  devotionalId: string;
  completedAt: string;
  hasJournal: boolean;
  hasPrayer: boolean;
  hasShared: boolean;
}
