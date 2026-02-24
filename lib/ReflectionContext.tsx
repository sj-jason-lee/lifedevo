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
import { useOnboarding } from './OnboardingContext';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

interface ShareToggledMeta {
  title: string;
  scripture: string;
  questions: string[];
  authorName: string;
  authorInitials: string;
  churchCode: string;
}

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
  setShareFlag: (devotionalId: string, questionIndex: number, share: boolean) => void;
  getShareFlag: (devotionalId: string, questionIndex: number) => boolean;
  shareReflection: (reflection: Omit<SharedReflection, 'id' | 'isCurrentUser' | 'sharedAt'>) => void;
  shareToggledAnswers: (devotionalId: string, meta: ShareToggledMeta) => void;
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
  const { user } = useAuth();
  const [store, setStore] = useState<ReflectionsStore>({
    answers: {},
    sharedIds: [],
  });
  const [communityFeed, setCommunityFeed] = useState<SharedReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Per-field debounce timers
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Ref to latest store for use inside debounced callbacks (avoids stale closures)
  const storeRef = useRef(store);
  storeRef.current = store;

  // Hydrate answers from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setStore({ answers: {}, sharedIds: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    storage.loadAnswers(user.id).then((loaded) => {
      setStore(loaded);
      setIsLoading(false);
    });
  }, [user?.id]);

  // Fetch community reflections from Supabase
  useEffect(() => {
    if (!user) {
      setCommunityFeed([]);
      return;
    }

    const fetchCommunity = async () => {
      const { data, error } = await supabase
        .from('shared_reflections')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: SharedReflection[] = data.map((row: any) => ({
          id: row.id,
          devotionalId: row.devotional_id,
          devotionalTitle: row.devotional_title,
          scripture: row.scripture,
          questionIndex: row.question_index,
          questionText: row.question_text,
          answerText: row.answer_text,
          authorName: row.author_name,
          authorInitials: row.author_initials,
          sharedAt: row.created_at,
          isCurrentUser: row.user_id === user.id,
          churchCode: row.church_code,
          userId: row.user_id,
        }));
        setCommunityFeed(mapped);
      }
    };

    fetchCommunity();

    // Subscribe to realtime inserts/updates
    const channel = supabase
      .channel('shared_reflections_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_reflections' },
        () => {
          // Re-fetch on any change
          fetchCommunity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Cleanup all debounce timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of debounceTimers.current.values()) {
        clearTimeout(timer);
      }
      debounceTimers.current.clear();
    };
  }, []);

  const updateAnswer = useCallback(
    (devotionalId: string, questionIndex: number, text: string) => {
      // Optimistic in-memory update
      setStore((prev) => {
        const existing = prev.answers[devotionalId] ?? {
          devotionalId,
          answers: {},
          shareFlags: {},
          lastModified: new Date().toISOString(),
        };
        return {
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
      });

      // Per-field debounced persist to Supabase
      if (!user) return;
      const key = `${devotionalId}-${questionIndex}`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        key,
        setTimeout(() => {
          debounceTimers.current.delete(key);
          // Read latest share flag from ref to avoid stale closure
          const shareFlag = storeRef.current.answers[devotionalId]?.shareFlags?.[questionIndex] !== false;
          storage.upsertAnswer(user.id, devotionalId, questionIndex, text, shareFlag);
        }, 500)
      );
    },
    [user]
  );

  const getAnswer = useCallback(
    (devotionalId: string, questionIndex: number): string => {
      return store.answers[devotionalId]?.answers[questionIndex] ?? '';
    },
    [store.answers]
  );

  const shareReflection = useCallback(
    (reflection: Omit<SharedReflection, 'id' | 'isCurrentUser' | 'sharedAt'>) => {
      const localId = `user-${reflection.devotionalId}-${reflection.questionIndex}`;

      // Optimistic local update
      const shared: SharedReflection = {
        ...reflection,
        id: localId,
        isCurrentUser: true,
        sharedAt: new Date().toISOString(),
      };
      setCommunityFeed((prev) => [shared, ...prev.filter((r) => r.id !== localId)]);

      // Upsert to Supabase
      if (user) {
        supabase
          .from('shared_reflections')
          .upsert(
            {
              user_id: user.id,
              devotional_id: reflection.devotionalId,
              devotional_title: reflection.devotionalTitle,
              scripture: reflection.scripture,
              question_index: reflection.questionIndex,
              question_text: reflection.questionText,
              answer_text: reflection.answerText,
              author_name: reflection.authorName,
              author_initials: reflection.authorInitials,
              church_code: reflection.churchCode,
            },
            { onConflict: 'user_id,devotional_id,question_index' }
          )
          .then(({ error }) => {
            if (error) console.warn('Failed to upsert reflection:', error.message);
          });
      }
    },
    [user]
  );

  // Derive "is shared" from communityFeed instead of local sharedIds
  const isShared = useCallback(
    (devotionalId: string, questionIndex: number): boolean => {
      return communityFeed.some(
        (r) =>
          r.isCurrentUser &&
          r.devotionalId === devotionalId &&
          r.questionIndex === questionIndex
      );
    },
    [communityFeed]
  );

  const setShareFlag = useCallback(
    (devotionalId: string, questionIndex: number, share: boolean) => {
      // Optimistic in-memory update
      setStore((prev) => {
        const existing = prev.answers[devotionalId] ?? {
          devotionalId,
          answers: {},
          shareFlags: {},
          lastModified: new Date().toISOString(),
        };
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [devotionalId]: {
              ...existing,
              shareFlags: { ...existing.shareFlags, [questionIndex]: share },
              lastModified: new Date().toISOString(),
            },
          },
        };
      });

      // Per-field debounced persist to Supabase
      if (!user) return;
      const key = `${devotionalId}-${questionIndex}-flag`;
      const existing = debounceTimers.current.get(key);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        key,
        setTimeout(() => {
          debounceTimers.current.delete(key);
          // Read latest answer text from ref to avoid stale closure
          const answerText = storeRef.current.answers[devotionalId]?.answers?.[questionIndex] ?? '';
          storage.upsertAnswer(user.id, devotionalId, questionIndex, answerText, share);
        }, 500)
      );
    },
    [user]
  );

  const getShareFlag = useCallback(
    (devotionalId: string, questionIndex: number): boolean => {
      const flag = store.answers[devotionalId]?.shareFlags?.[questionIndex];
      return flag !== false; // default true (opt-out model)
    },
    [store.answers]
  );

  const shareToggledAnswers = useCallback(
    (devotionalId: string, meta: ShareToggledMeta) => {
      const devAnswers = store.answers[devotionalId];
      if (!devAnswers) return;

      for (const [indexStr, text] of Object.entries(devAnswers.answers)) {
        const qi = Number(indexStr);
        if (!text.trim()) continue;
        // Skip if already shared
        if (isShared(devotionalId, qi)) continue;
        // Skip if user toggled off sharing for this answer
        const flag = devAnswers.shareFlags?.[qi];
        if (flag === false) continue;

        shareReflection({
          devotionalId,
          devotionalTitle: meta.title,
          scripture: meta.scripture,
          questionIndex: qi,
          questionText: meta.questions[qi] ?? '',
          answerText: text.trim(),
          authorName: meta.authorName,
          authorInitials: meta.authorInitials,
          churchCode: meta.churchCode,
          userId: '',
        });
      }
    },
    [store.answers, isShared, shareReflection]
  );

  return (
    <ReflectionContext.Provider
      value={{
        answers: store.answers,
        communityFeed,
        isLoading,
        updateAnswer,
        getAnswer,
        setShareFlag,
        getShareFlag,
        shareReflection,
        shareToggledAnswers,
        isShared,
      }}
    >
      {children}
    </ReflectionContext.Provider>
  );
};
