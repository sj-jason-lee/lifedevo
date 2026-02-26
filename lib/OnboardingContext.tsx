import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { OnboardingStore, UserRole } from '../types';
import * as storage from './onboardingStorage';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { logger } from './logger';

interface OnboardingContextValue {
  isComplete: boolean;
  isLoading: boolean;
  userName: string;
  churchCode: string;
  role: UserRole;
  isAuthor: boolean;
  isAdmin: boolean;
  initials: string;
  hasProfile: boolean;
  setUserName: (name: string) => void;
  setChurchCode: (code: string) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const useOnboarding = (): OnboardingContextValue => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

const deriveInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [store, setStore] = useState<OnboardingStore>({
    completed: false,
    userName: '',
    churchCode: '',
    role: 'reader',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from Supabase (with AsyncStorage fallback)
  useEffect(() => {
    const loadProfile = async () => {
      // Always load local cache first
      const local = await storage.load();

      if (user) {
        // Try to fetch profile from Supabase
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_name, church_code, role')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            const merged: OnboardingStore = {
              completed: local.completed || (data.user_name ?? '').length > 0,
              userName: data.user_name || local.userName,
              churchCode: data.church_code || local.churchCode,
              role: (data.role as UserRole) || 'reader',
            };
            setStore(merged);
            // Update local cache
            storage.save(merged);

            // Sync local name back to Supabase if remote is empty
            if (!data.user_name && local.userName && user) {
              supabase
                .from('profiles')
                .update({ user_name: local.userName, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .then(({ error: syncErr }) => {
                  if (syncErr) logger.warn('[OnboardingContext] Failed to sync user_name to Supabase:', syncErr.message);
                });
            }

            setIsLoading(false);
            return;
          }
        } catch {
          // Supabase fetch failed — fall back to local
        }
      }

      // Fallback to local storage
      setStore(local);
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const setUserName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (trimmed.length === 0) {
        logger.warn('[OnboardingContext] setUserName called with empty name, ignoring');
        return;
      }

      setStore((prev) => {
        const updated = { ...prev, userName: trimmed };
        storage.save(updated);
        return updated;
      });

      // Persist to Supabase if authenticated
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ user_name: trimmed, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          logger.warn('[OnboardingContext] Failed to persist user_name:', error.message);
        } else {
          logger.debug('[OnboardingContext] user_name persisted to Supabase for', user.id.slice(0, 8));
        }
      } else {
        logger.warn('[OnboardingContext] setUserName called but user is null — name only saved locally');
      }
    },
    [user]
  );

  const setChurchCode = useCallback(
    (code: string) => {
      setStore((prev) => {
        const updated = { ...prev, churchCode: code };
        storage.save(updated);
        return updated;
      });

      // Persist to Supabase if authenticated
      if (user) {
        supabase
          .from('profiles')
          .update({ church_code: code, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) logger.warn('[OnboardingContext] Failed to sync church_code:', error.message);
          });
      }
    },
    [user]
  );

  const completeOnboarding = useCallback(() => {
    setStore((prev) => {
      const updated = { ...prev, completed: true };
      storage.save(updated);
      return updated;
    });
  }, []);

  const initials = useMemo(() => deriveInitials(store.userName), [store.userName]);
  const hasProfile = store.userName.trim().length > 0;
  const role = store.role ?? 'reader';
  const isAuthor = role === 'author' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <OnboardingContext.Provider
      value={{
        isComplete: store.completed,
        isLoading,
        userName: store.userName,
        churchCode: store.churchCode,
        role,
        isAuthor,
        isAdmin,
        initials,
        hasProfile,
        setUserName,
        setChurchCode,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
