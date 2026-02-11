import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  mockDevotionals,
  mockSharedReflections,
} from './mockData';
import {
  loadPersistedState,
  persistUser,
  persistChurch,
  persistAuth,
  persistJournalEntries,
  persistPrayers,
  persistCompletions,
  clearAllData,
  saveLocalChurch,
  findLocalChurchByCode,
} from './storage';
import * as api from './supabaseApi';

export interface AppState {
  user: User | null;
  church: Church | null;
  isAuthenticated: boolean;
  devotionals: Devotional[];
  journalEntries: JournalEntry[];
  prayers: Prayer[];
  sharedReflections: SharedReflection[];
  completions: DevotionalCompletion[];
  isLoading: boolean;
}

export interface AppActions {
  login: () => void;
  loginWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<string | null>;
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
  createChurch: (name: string) => Promise<string | null>;
  joinChurch: (inviteCode: string) => Promise<string | null>;
  leaveChurch: () => void;
}

export type AppContextType = AppState & AppActions;

export const initialState: AppState = {
  user: null,
  church: null,
  isAuthenticated: false,
  devotionals: mockDevotionals,
  journalEntries: [],
  prayers: [],
  sharedReflections: mockSharedReflections,
  completions: [],
  isLoading: true,
};

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Try to load data from Supabase; returns null if tables don't exist yet
async function loadSupabaseData(userId: string, churchId?: string) {
  try {
    const [journalEntries, prayers, completions] = await Promise.all([
      api.getJournalEntries(userId),
      api.getPrayers(userId),
      api.getCompletions(userId),
    ]);

    let devotionals: Devotional[] | null = null;
    let sharedReflections: SharedReflection[] | null = null;
    if (churchId) {
      [devotionals, sharedReflections] = await Promise.all([
        api.getDevotionals(churchId),
        api.getSharedReflections(churchId),
      ]);
    }

    return { journalEntries, prayers, completions, devotionals, sharedReflections };
  } catch (e) {
    // Tables likely don't exist yet — fall back gracefully
    console.log('Supabase data load skipped (tables may not exist yet):', e);
    return null;
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const isInitialized = useRef(false);

  // Load persisted state and check for Supabase session on mount
  useEffect(() => {
    (async () => {
      try {
        // First, restore local state from AsyncStorage
        const persisted = await loadPersistedState();

        // Check for existing Supabase session
        const session = await api.getSession();

        if (session?.user) {
          // We have a Supabase session — load or create profile
          const profile = await api.ensureProfile(session.user);
          if (profile) {
            // Try loading data from Supabase
            const supaData = await loadSupabaseData(profile.id, profile.churchId);

            const church = profile.churchId ? await api.getChurch(profile.churchId) : null;

            setState((prev) => ({
              ...prev,
              user: profile,
              church,
              isAuthenticated: true,
              journalEntries: supaData?.journalEntries || persisted.journalEntries || [],
              prayers: supaData?.prayers || persisted.prayers || [],
              completions: supaData?.completions || persisted.completions || [],
              devotionals: supaData?.devotionals || prev.devotionals,
              sharedReflections: supaData?.sharedReflections || prev.sharedReflections,
              isLoading: false,
            }));

            persistAuth(true);
            persistUser(profile);
            if (church) persistChurch(church);
            isInitialized.current = true;
            return;
          }
        }

        // No Supabase session — use AsyncStorage persisted state
        setState((prev) => ({
          ...prev,
          ...persisted,
          devotionals: prev.devotionals,
          sharedReflections: prev.sharedReflections,
          isLoading: false,
        }));
      } catch (e) {
        console.warn('Failed to load state:', e);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
      isInitialized.current = true;
    })();
  }, []);

  // Persist user-generated data whenever it changes (skip initial load)
  useEffect(() => {
    if (!isInitialized.current) return;
    persistJournalEntries(state.journalEntries);
  }, [state.journalEntries]);

  useEffect(() => {
    if (!isInitialized.current) return;
    persistPrayers(state.prayers);
  }, [state.prayers]);

  useEffect(() => {
    if (!isInitialized.current) return;
    persistCompletions(state.completions);
  }, [state.completions]);

  useEffect(() => {
    if (!isInitialized.current) return;
    persistUser(state.user);
  }, [state.user]);

  // Legacy mock login (for demo/testing)
  const login = useCallback(() => {
    const { mockUser, mockChurch, mockJournalEntries, mockPrayers, mockCompletions } = require('./mockData');
    setState((prev) => ({
      ...prev,
      user: mockUser,
      church: mockChurch,
      isAuthenticated: true,
      journalEntries: mockJournalEntries,
      prayers: mockPrayers,
      completions: mockCompletions,
    }));
    persistAuth(true);
    persistUser(mockUser);
    persistChurch(mockChurch);
  }, []);

  // Real Supabase email/password sign in
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const { session, user: authUser } = await api.signIn(email, password);
      if (!authUser) return 'Sign in failed';

      // Create profile on first sign-in (e.g. after email confirmation)
      const profile = await api.ensureProfile(authUser);
      if (!profile) return 'Profile not found';

      const church = profile.churchId ? await api.getChurch(profile.churchId) : null;
      const supaData = await loadSupabaseData(profile.id, profile.churchId);

      setState((prev) => ({
        ...prev,
        user: profile,
        church,
        isAuthenticated: true,
        journalEntries: supaData?.journalEntries || [],
        prayers: supaData?.prayers || [],
        completions: supaData?.completions || [],
        devotionals: supaData?.devotionals || prev.devotionals,
        sharedReflections: supaData?.sharedReflections || prev.sharedReflections,
      }));

      persistAuth(true);
      persistUser(profile);
      if (church) persistChurch(church);

      return null; // no error
    } catch (e: any) {
      return e.message || 'Sign in failed';
    }
  }, []);

  // Real Supabase email/password sign up
  const signUpWithEmail = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    try {
      const { session, user: authUser } = await api.signUp(email, password, name);
      if (!authUser) return 'Sign up failed';

      // No session means email confirmation is required
      if (!session) {
        return 'CONFIRM_EMAIL';
      }

      // Session available — create profile and log in
      const profile = await api.ensureProfile(authUser);
      if (!profile) return 'Profile creation failed';

      setState((prev) => ({
        ...prev,
        user: profile,
        church: null,
        isAuthenticated: true,
        journalEntries: [],
        prayers: [],
        completions: [],
      }));

      persistAuth(true);
      persistUser(profile);

      return null; // no error
    } catch (e: any) {
      return e.message || 'Sign up failed';
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
    setState((prev) => ({
      ...prev,
      user: null,
      church: null,
      isAuthenticated: false,
      journalEntries: [],
      prayers: [],
      completions: [],
    }));
    clearAllData();
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

      // Optimistic local update
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

      // Fire-and-forget Supabase sync
      api.upsertJournalEntry({
        user_id: entry.userId,
        devotional_id: entry.devotionalId,
        question_id: entry.questionId,
        content: entry.content,
        is_shared: entry.isShared,
      }).catch((e) => console.log('Supabase journal sync skipped:', e));
    },
    []
  );

  const savePrayer = useCallback(
    (prayer: Omit<Prayer, 'id' | 'createdAt' | 'prayingCount'>) => {
      const now = new Date().toISOString();

      // Optimistic local update
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

      // Fire-and-forget Supabase sync
      api.upsertPrayer({
        user_id: prayer.userId,
        user_name: prayer.userName,
        devotional_id: prayer.devotionalId,
        content: prayer.content,
        is_request: prayer.isRequest,
        is_shared: prayer.isShared,
      }).catch((e) => console.log('Supabase prayer sync skipped:', e));
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

        // Fire-and-forget Supabase sync
        if (prev.user) {
          api.createCompletion(prev.user.id, {
            devotional_id: devotionalId,
            has_journal: hasJournal,
            has_prayer: hasPrayer,
            has_shared: hasShared,
          }).catch((e) => console.log('Supabase completion sync skipped:', e));

          api.updateProfile(prev.user.id, {
            streak_count: (prev.user.streakCount || 0) + 1,
            last_active_date: new Date().toISOString().split('T')[0],
          }).catch((e) => console.log('Supabase streak sync skipped:', e));
        }

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
    setState((prev) => {
      const prayer = prev.prayers.find((p) => p.id === prayerId);
      const newIsAnswered = prayer ? !prayer.isAnswered : true;

      // Fire-and-forget Supabase sync
      api.togglePrayerAnsweredApi(prayerId, newIsAnswered, answerNote)
        .catch((e) => console.log('Supabase prayer toggle skipped:', e));

      return {
        ...prev,
        prayers: prev.prayers.map((p) =>
          p.id === prayerId ? { ...p, isAnswered: newIsAnswered, answerNote: answerNote || p.answerNote } : p
        ),
      };
    });
  }, []);

  const getUserPrayers = useCallback(
    () => state.prayers.filter((p) => p.userId === state.user?.id),
    [state.prayers, state.user]
  );

  const createChurch = useCallback(async (name: string): Promise<string | null> => {
    try {
      const userId = state.user?.id;
      if (!userId) return 'Not signed in';

      // Try Supabase first
      let church;
      try {
        church = await api.createChurch(name, userId);
        // Update profile to pastor role
        await api.updateProfile(userId, {
          church_id: church.id,
          church_name: church.name,
          role: 'pastor',
        });
      } catch (e) {
        // Supabase unavailable — create locally for demo mode
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        church = {
          id: `church-${Date.now()}`,
          name,
          inviteCode,
          createdBy: userId,
          memberCount: 1,
          createdAt: new Date().toISOString(),
        };
      }

      // Always save locally so the code is joinable
      await saveLocalChurch(church);

      setState((prev) => ({
        ...prev,
        church,
        user: prev.user ? { ...prev.user, churchId: church.id, churchName: church.name, role: 'pastor' as const } : null,
      }));
      persistChurch(church);
      if (state.user) {
        persistUser({ ...state.user, churchId: church.id, churchName: church.name, role: 'pastor' });
      }

      return null;
    } catch (e: any) {
      return e.message || 'Failed to create church';
    }
  }, [state.user]);

  const joinChurch = useCallback(async (inviteCode: string): Promise<string | null> => {
    try {
      const userId = state.user?.id;
      if (!userId) return 'Not signed in';

      let church;

      // Try Supabase first
      try {
        church = await api.joinChurchByCode(inviteCode, userId);
      } catch (e) {
        // Supabase failed — check local churches
        church = null;
      }

      // Fallback: check locally-created churches
      if (!church) {
        const localChurch = await findLocalChurchByCode(inviteCode);
        if (localChurch) {
          church = { ...localChurch, memberCount: (localChurch.memberCount || 0) + 1 };
          await saveLocalChurch(church);
        }
      }

      // Fallback: check mock church code
      if (!church) {
        const { mockChurch } = require('./mockData');
        if (mockChurch.inviteCode.toUpperCase() === inviteCode.toUpperCase()) {
          church = mockChurch;
        }
      }

      if (!church) {
        return 'Church not found with that invite code';
      }

      setState((prev) => ({
        ...prev,
        church,
        user: prev.user ? { ...prev.user, churchId: church!.id, churchName: church!.name } : null,
      }));
      persistChurch(church);
      if (state.user) {
        persistUser({ ...state.user, churchId: church.id, churchName: church.name });
      }

      return null;
    } catch (e: any) {
      return e.message || 'Failed to join church';
    }
  }, [state.user]);

  const leaveChurch = useCallback(() => {
    if (state.user) {
      api.updateProfile(state.user.id, {
        church_id: '',
        church_name: '',
      }).catch((e) => console.log('Supabase leave church skipped:', e));
    }

    setState((prev) => ({
      ...prev,
      church: null,
      user: prev.user ? { ...prev.user, churchId: '', churchName: '' } : null,
    }));
    persistChurch(null);
    if (state.user) {
      persistUser({ ...state.user, churchId: '', churchName: '' });
    }
  }, [state.user]);

  return {
    ...state,
    login,
    loginWithEmail,
    signUpWithEmail,
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
    createChurch,
    joinChurch,
    leaveChurch,
  };
}
