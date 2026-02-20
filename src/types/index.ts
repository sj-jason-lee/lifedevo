export type UserRole = 'reader' | 'shepherd';

export type UserProfile = {
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  hasCompletedOnboarding: boolean;
  photoURL: string | null;
  bio: string | null;
  churchName: string | null;
  notificationTime: string | null;
  readingGoal: 'daily' | 'weekly' | null;
  devotionalFrequency: 'every_day' | 'weekdays' | 'custom' | null;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  imageURL: string | null;
  shepherdId: string;
  inviteCode: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Membership = {
  id: string;
  groupId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
};
