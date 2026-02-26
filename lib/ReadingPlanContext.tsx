import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { ReadingPlan, ReadingPlanStore } from '../types';
import * as storage from './readingPlanStorage';
import * as planData from './readingPlanData';
import { useAuth } from './AuthContext';

interface ReadingPlanContextValue {
  isLoading: boolean;
  allPlans: ReadingPlan[];
  userPlanIds: string[];
  userPlans: ReadingPlan[];
  followPlan: (planId: string) => void;
  unfollowPlan: (planId: string) => void;
  isFollowing: (planId: string) => boolean;
  isDayComplete: (planId: string, day: number) => boolean;
  toggleDay: (planId: string, day: number) => void;
  completedCount: (planId: string) => number;
  completedDays: (planId: string) => number[];
  currentDay: (planId: string, totalDays: number) => number;
  completedDayAt: (planId: string, day: number) => string | undefined;
}

const ReadingPlanContext = createContext<ReadingPlanContextValue | null>(null);

export const useReadingPlan = (): ReadingPlanContextValue => {
  const ctx = useContext(ReadingPlanContext);
  if (!ctx) throw new Error('useReadingPlan must be used within ReadingPlanProvider');
  return ctx;
};

export const ReadingPlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [store, setStore] = useState<ReadingPlanStore>({
    completedDays: {},
    completedDayAt: {},
  });
  const [allPlans, setAllPlans] = useState<ReadingPlan[]>([]);
  const [userPlanIds, setUserPlanIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load plan catalog on mount (public, no auth needed)
  useEffect(() => {
    planData.getAllPlans().then(setAllPlans);
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    if (!user?.id) {
      setStore({ completedDays: {}, completedDayAt: {} });
      setUserPlanIds([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([
      storage.load(user.id),
      planData.getUserPlanIds(user.id),
    ]).then(([loaded, ids]) => {
      setStore(loaded);
      setUserPlanIds(ids);
      setIsLoading(false);
    });
  }, [user?.id]);

  // Derived: user's active plans filtered from catalog
  const userPlans = useMemo(
    () => allPlans.filter((p) => userPlanIds.includes(p.id)),
    [allPlans, userPlanIds],
  );

  const followPlanFn = useCallback(
    (planId: string): void => {
      setUserPlanIds((prev) => (prev.includes(planId) ? prev : [...prev, planId]));
      if (user?.id) {
        planData.followPlan(user.id, planId);
      }
    },
    [user?.id],
  );

  const unfollowPlanFn = useCallback(
    (planId: string): void => {
      setUserPlanIds((prev) => prev.filter((id) => id !== planId));
      if (user?.id) {
        planData.unfollowPlan(user.id, planId);
      }
    },
    [user?.id],
  );

  const isFollowing = useCallback(
    (planId: string): boolean => userPlanIds.includes(planId),
    [userPlanIds],
  );

  const isDayComplete = useCallback(
    (planId: string, day: number): boolean => {
      return (store.completedDays[planId] ?? []).includes(day);
    },
    [store.completedDays]
  );

  const toggleDay = useCallback(
    (planId: string, day: number): void => {
      setStore((prev) => {
        const days = prev.completedDays[planId] ?? [];
        const alreadyComplete = days.includes(day);
        let updated: ReadingPlanStore;

        if (alreadyComplete) {
          const { [day]: _, ...restAt } = prev.completedDayAt[planId] ?? {};
          updated = {
            completedDays: {
              ...prev.completedDays,
              [planId]: days.filter((d) => d !== day),
            },
            completedDayAt: {
              ...prev.completedDayAt,
              [planId]: restAt,
            },
          };
        } else {
          updated = {
            completedDays: {
              ...prev.completedDays,
              [planId]: [...days, day],
            },
            completedDayAt: {
              ...prev.completedDayAt,
              [planId]: {
                ...(prev.completedDayAt[planId] ?? {}),
                [day]: new Date().toISOString(),
              },
            },
          };
        }

        if (user?.id) {
          storage.toggleDay(user.id, planId, day, !alreadyComplete);
        }
        return updated;
      });
    },
    [user?.id]
  );

  const completedCount = useCallback(
    (planId: string): number => {
      return (store.completedDays[planId] ?? []).length;
    },
    [store.completedDays]
  );

  const completedDays = useCallback(
    (planId: string): number[] => {
      return store.completedDays[planId] ?? [];
    },
    [store.completedDays]
  );

  const currentDay = useCallback(
    (planId: string, totalDays: number): number => {
      const done = store.completedDays[planId] ?? [];
      for (let d = 1; d <= totalDays; d++) {
        if (!done.includes(d)) return d;
      }
      return totalDays;
    },
    [store.completedDays]
  );

  const completedDayAt = useCallback(
    (planId: string, day: number): string | undefined => {
      return (store.completedDayAt[planId] ?? {})[day];
    },
    [store.completedDayAt]
  );

  return (
    <ReadingPlanContext.Provider
      value={{
        isLoading,
        allPlans,
        userPlanIds,
        userPlans,
        followPlan: followPlanFn,
        unfollowPlan: unfollowPlanFn,
        isFollowing,
        isDayComplete,
        toggleDay,
        completedCount,
        completedDays,
        currentDay,
        completedDayAt,
      }}
    >
      {children}
    </ReadingPlanContext.Provider>
  );
};
