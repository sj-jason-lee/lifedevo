export type DevotionalStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type UserRole = 'reader' | 'author' | 'admin';

export interface Devotional {
  id: string;
  title: string;
  scripture: string;
  scriptureText: string;
  body: string;
  reflectQuestions: string[];
  prayer: string;
  date: string;
  readTimeMinutes: number;
  author: string;
  churchId: string | null;
}

export interface DevotionalRow {
  id: string;
  title: string;
  scripture: string;
  scripture_text: string;
  body: string;
  reflect_questions: string[];
  prayer: string;
  date: string;
  read_time_minutes: number;
  author_name: string;
  author_id: string | null;
  church_id: string | null;
  status: DevotionalStatus;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingPlanDay {
  day: number;
  passage: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  totalDays: number;
  description: string;
  days: ReadingPlanDay[];
}

export interface ReadingPlanStore {
  completedDays: Record<string, number[]>; // planId → day numbers
  completedDayAt: Record<string, Record<number, string>>; // planId → day → ISO timestamp
}

export interface DevotionalAnswers {
  devotionalId: string;
  answers: Record<number, string>; // questionIndex → answer text
  shareFlags: Record<number, boolean>; // questionIndex → share with community (default true)
  lastModified: string;
}

export interface SharedReflection {
  id: string;
  devotionalId: string;
  devotionalTitle: string;
  scripture: string;
  questionIndex: number;
  questionText: string;
  answerText: string;
  authorName: string;
  authorInitials: string;
  sharedAt: string;
  isCurrentUser: boolean;
  churchCode: string;
  userId: string;
}

export interface ReflectionsStore {
  answers: Record<string, DevotionalAnswers>; // keyed by devotionalId
  sharedIds: string[];
}

export interface CompletionStore {
  completedIds: string[];   // devotional IDs
  completedAt: Record<string, string>; // devotionalId → ISO timestamp
}

export interface OnboardingStore {
  completed: boolean;
  userName: string;
  churchCode: string;
  role?: UserRole;
}

// Church Management
export type ChurchRole = 'leader' | 'member';

export interface Church {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
}

export interface ChurchMember {
  id: string;
  churchId: string;
  userId: string;
  churchRole: ChurchRole;
  joinedAt: string;
  userName: string;
  initials: string;
}
