import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  User,
  Devotional,
  JournalEntry,
  Prayer,
  SharedReflection,
  DevotionalCompletion,
  Church,
} from '../types';
import {
  mockUser,
  mockChurch,
  mockDevotionals,
  mockJournalEntries,
  mockPrayers,
  mockSharedReflections,
  mockCompletions,
} from './mockData';

export interface AppState {
  user: User | null;
  church: Church | null;
  isAuthenticated: boolean;
  devotionals: Devotional[];
  journalEntries: JournalEntry[];
  prayers: Prayer[];
  sharedReflections: SharedReflection[];
  completions: DevotionalCompletion[];
}

export interface AppActions {
  login: () => void;
  logout: () => void;
  getTodayDevotional: () => Devotional | undefined;
  getDevotionalById: (id: string) => Devotional | undefined;
  getJournalForDevotional: (devotionalId: string) => JournalEntry[];
  getPrayerForDevotional: (devotionalId: string) => Prayer | undefined;
  saveJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  savePrayer: (prayer: Omit<Prayer, 'id' | 'createdAt' | 'prayingCount'>) => void;
  completeDevotional: (devotionalId: string, hasJournal: boolean, hasPrayer: boolean, hasShared: boolean) => void;
  isDevotionalCompleted: (devotionalId: string) => boolean;
  togglePrayerAnswered: (prayerId: string, answerNote?: string) => void;
  getUserPrayers: () => Prayer[];
}

export type AppContextType = AppState & AppActions;

export const initialState: AppState = {
  user: null,
  church: null,
  isAuthenticated: false,
  devotionals: mockDevotionals,
  journalEntries: mockJournalEntries,
  prayers: mockPrayers,
  sharedReflections: mockSharedReflections,
  completions: mockCompletions,
};

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  const login = useCallback(() => {
    setState((prev) => ({
      ...prev,
      user: mockUser,
      church: mockChurch,
      isAuthenticated: true,
    }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      user: null,
      church: null,
      isAuthenticated: false,
    }));
  }, []);

  const getTodayDevotional = useCallback(() => {
    const today = new Date().toDateString();
    return state.devotionals.find(
      (d) => d.status === 'published' && new Date(d.publishedAt).toDateString() === today
    );
  }, [state.devotionals]);

  const getDevotionalById = useCallback(
    (id: string) => state.devotionals.find((d) => d.id === id),
    [state.devotionals]
  );

  const getJournalForDevotional = useCallback(
    (devotionalId: string) =>
      state.journalEntries.filter((e) => e.devotionalId === devotionalId && e.userId === state.user?.id),
    [state.journalEntries, state.user]
  );

  const getPrayerForDevotional = useCallback(
    (devotionalId: string) =>
      state.prayers.find((p) => p.devotionalId === devotionalId && p.userId === state.user?.id),
    [state.prayers, state.user]
  );

  const saveJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      setState((prev) => {
        const existing = prev.journalEntries.find(
          (e) =>
            e.devotionalId === entry.devotionalId &&
            e.questionId === entry.questionId &&
            e.userId === entry.userId
        );
        if (existing) {
          return {
            ...prev,
            journalEntries: prev.journalEntries.map((e) =>
              e.id === existing.id ? { ...e, content: entry.content, updatedAt: now } : e
            ),
          };
        }
        const newEntry: JournalEntry = {
          ...entry,
          id: `je-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, journalEntries: [...prev.journalEntries, newEntry] };
      });
    },
    []
  );

  const savePrayer = useCallback(
    (prayer: Omit<Prayer, 'id' | 'createdAt' | 'prayingCount'>) => {
      const now = new Date().toISOString();
      setState((prev) => {
        const existing = prev.prayers.find(
          (p) => p.devotionalId === prayer.devotionalId && p.userId === prayer.userId
        );
        if (existing) {
          return {
            ...prev,
            prayers: prev.prayers.map((p) =>
              p.id === existing.id ? { ...p, content: prayer.content, isRequest: prayer.isRequest, isShared: prayer.isShared } : p
            ),
          };
        }
        const newPrayer: Prayer = {
          ...prayer,
          id: `prayer-${Date.now()}`,
          createdAt: now,
          prayingCount: 0,
        };
        return { ...prev, prayers: [...prev.prayers, newPrayer] };
      });
    },
    []
  );

  const completeDevotional = useCallback(
    (devotionalId: string, hasJournal: boolean, hasPrayer: boolean, hasShared: boolean) => {
      setState((prev) => {
        if (prev.completions.find((c) => c.devotionalId === devotionalId)) return prev;
        const newCompletion: DevotionalCompletion = {
          devotionalId,
          completedAt: new Date().toISOString(),
          hasJournal,
          hasPrayer,
          hasShared,
        };
        const newUser = prev.user
          ? { ...prev.user, streakCount: prev.user.streakCount + 1, lastActiveDate: new Date().toISOString().split('T')[0] }
          : null;
        return { ...prev, completions: [...prev.completions, newCompletion], user: newUser };
      });
    },
    []
  );

  const isDevotionalCompleted = useCallback(
    (devotionalId: string) => state.completions.some((c) => c.devotionalId === devotionalId),
    [state.completions]
  );

  const togglePrayerAnswered = useCallback((prayerId: string, answerNote?: string) => {
    setState((prev) => ({
      ...prev,
      prayers: prev.prayers.map((p) =>
        p.id === prayerId ? { ...p, isAnswered: !p.isAnswered, answerNote: answerNote || p.answerNote } : p
      ),
    }));
  }, []);

  const getUserPrayers = useCallback(
    () => state.prayers.filter((p) => p.userId === state.user?.id),
    [state.prayers, state.user]
  );

  return {
    ...state,
    login,
    logout,
    getTodayDevotional,
    getDevotionalById,
    getJournalForDevotional,
    getPrayerForDevotional,
    saveJournalEntry,
    savePrayer,
    completeDevotional,
    isDevotionalCompleted,
    togglePrayerAnswered,
    getUserPrayers,
  };
}
