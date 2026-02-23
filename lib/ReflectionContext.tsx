import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import type {
  ReflectionsStore,
  DevotionalAnswers,
  SharedReflection,
} from '../types';
import * as storage from './reflectionStorage';
import { mockCommunityReflections } from './communityData';
import { useOnboarding } from './OnboardingContext';

interface ReflectionContextValue {
  answers: Record<string, DevotionalAnswers>;
  communityFeed: SharedReflection[];
  isLoading: boolean;
  updateAnswer: (
    devotionalId: string,
    questionIndex: number,
    text: string
  ) => void;
  getAnswer: (devotionalId: string, questionIndex: number) => string;
  shareReflection: (reflection: Omit<SharedReflection, 'id' | 'isCurrentUser' | 'sharedAt'>) => void;
  isShared: (devotionalId: string, questionIndex: number) => boolean;
}

const ReflectionContext = createContext<ReflectionContextValue | null>(null);

export const useReflections = (): ReflectionContextValue => {
  const ctx = useContext(ReflectionContext);
  if (!ctx) throw new Error('useReflections must be used within ReflectionProvider');
  return ctx;
};

export const ReflectionProvider = ({ children }: { children: ReactNode }) => {
  const { churchCode: userChurchCode } = useOnboarding();
  const [store, setStore] = useState<ReflectionsStore>({
    answers: {},
    sharedIds: [],
  });
  const [userShared, setUserShared] = useState<SharedReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    storage.load().then((loaded) => {
      setStore(loaded);
      setIsLoading(false);
    });
  }, []);

  // Debounced persist to AsyncStorage
  const persistStore = useCallback((newStore: ReflectionsStore) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      storage.save(newStore);
    }, 500);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const updateAnswer = useCallback(
    (devotionalId: string, questionIndex: number, text: string) => {
      setStore((prev) => {
        const existing = prev.answers[devotionalId] ?? {
          devotionalId,
          answers: {},
          lastModified: new Date().toISOString(),
        };
        const updated: ReflectionsStore = {
          ...prev,
          answers: {
            ...prev.answers,
            [devotionalId]: {
              ...existing,
              answers: { ...existing.answers, [questionIndex]: text },
              lastModified: new Date().toISOString(),
            },
          },
        };
        persistStore(updated);
        return updated;
      });
    },
    [persistStore]
  );

  const getAnswer = useCallback(
    (devotionalId: string, questionIndex: number): string => {
      return store.answers[devotionalId]?.answers[questionIndex] ?? '';
    },
    [store.answers]
  );

  const shareReflection = useCallback(
    (reflection: Omit<SharedReflection, 'id' | 'isCurrentUser' | 'sharedAt'>) => {
      const id = `user-${reflection.devotionalId}-${reflection.questionIndex}`;
      const shared: SharedReflection = {
        ...reflection,
        id,
        isCurrentUser: true,
        sharedAt: new Date().toISOString(),
      };
      setUserShared((prev) => [shared, ...prev.filter((r) => r.id !== id)]);
      setStore((prev) => {
        const updated: ReflectionsStore = {
          ...prev,
          sharedIds: prev.sharedIds.includes(id)
            ? prev.sharedIds
            : [...prev.sharedIds, id],
        };
        persistStore(updated);
        return updated;
      });
    },
    [persistStore]
  );

  const isShared = useCallback(
    (devotionalId: string, questionIndex: number): boolean => {
      const id = `user-${devotionalId}-${questionIndex}`;
      return store.sharedIds.includes(id);
    },
    [store.sharedIds]
  );

  // Merge user shared + mock community, filtered by church code, sorted reverse-chronologically
  const communityFeed: SharedReflection[] = [
    ...userShared,
    ...mockCommunityReflections,
  ]
    .filter(
      (r) =>
        r.isCurrentUser ||
        (userChurchCode !== '' && r.churchCode === userChurchCode)
    )
    .sort(
      (a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
    );

  return (
    <ReflectionContext.Provider
      value={{
        answers: store.answers,
        communityFeed,
        isLoading,
        updateAnswer,
        getAnswer,
        shareReflection,
        isShared,
      }}
    >
      {children}
    </ReflectionContext.Provider>
  );
};
