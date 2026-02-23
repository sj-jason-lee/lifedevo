import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { ReadingPlanStore } from '../types';
import * as storage from './readingPlanStorage';

interface ReadingPlanContextValue {
  isLoading: boolean;
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
  const [store, setStore] = useState<ReadingPlanStore>({
    completedDays: {},
    completedDayAt: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.load().then((loaded) => {
      setStore(loaded);
      setIsLoading(false);
    });
  }, []);

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

        storage.save(updated);
        return updated;
      });
    },
    []
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
