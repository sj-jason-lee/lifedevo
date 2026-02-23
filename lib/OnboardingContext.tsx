import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { OnboardingStore } from '../types';
import * as storage from './onboardingStorage';

interface OnboardingContextValue {
  isComplete: boolean;
  isLoading: boolean;
  userName: string;
  churchCode: string;
  initials: string;
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
  const [store, setStore] = useState<OnboardingStore>({
    completed: false,
    userName: '',
    churchCode: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.load().then((loaded) => {
      setStore(loaded);
      setIsLoading(false);
    });
  }, []);

  const setUserName = useCallback((name: string) => {
    setStore((prev) => {
      const updated = { ...prev, userName: name };
      storage.save(updated);
      return updated;
    });
  }, []);

  const setChurchCode = useCallback((code: string) => {
    setStore((prev) => {
      const updated = { ...prev, churchCode: code };
      storage.save(updated);
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setStore((prev) => {
      const updated = { ...prev, completed: true };
      storage.save(updated);
      return updated;
    });
  }, []);

  const initials = useMemo(() => deriveInitials(store.userName), [store.userName]);

  return (
    <OnboardingContext.Provider
      value={{
        isComplete: store.completed,
        isLoading,
        userName: store.userName,
        churchCode: store.churchCode,
        initials,
        setUserName,
        setChurchCode,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
