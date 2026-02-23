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
}
