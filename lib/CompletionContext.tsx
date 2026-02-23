import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type { CompletionStore } from '../types';
import * as storage from './completionStorage';

interface CompletionContextValue {
  completedIds: string[];
  isLoading: boolean;
  isComplete: (devotionalId: string) => boolean;
  toggleComplete: (devotionalId: string) => void;
  completedAt: (devotionalId: string) => string | undefined;
}

const CompletionContext = createContext<CompletionContextValue | null>(null);

export const useCompletions = (): CompletionContextValue => {
  const ctx = useContext(CompletionContext);
  if (!ctx) throw new Error('useCompletions must be used within CompletionProvider');
  return ctx;
};

export const CompletionProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<CompletionStore>({
    completedIds: [],
    completedAt: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.load().then((loaded) => {
      setStore(loaded);
      setIsLoading(false);
    });
  }, []);

  const isComplete = useCallback(
    (devotionalId: string): boolean => {
      return store.completedIds.includes(devotionalId);
    },
    [store.completedIds]
  );

  const toggleComplete = useCallback(
    (devotionalId: string): void => {
      setStore((prev) => {
        const alreadyComplete = prev.completedIds.includes(devotionalId);
        let updated: CompletionStore;
        if (alreadyComplete) {
          const { [devotionalId]: _, ...restAt } = prev.completedAt;
          updated = {
            completedIds: prev.completedIds.filter((id) => id !== devotionalId),
            completedAt: restAt,
          };
        } else {
          updated = {
            completedIds: [...prev.completedIds, devotionalId],
            completedAt: {
              ...prev.completedAt,
              [devotionalId]: new Date().toISOString(),
            },
          };
        }
        storage.save(updated);
        return updated;
      });
    },
    []
  );

  const completedAt = useCallback(
    (devotionalId: string): string | undefined => {
      return store.completedAt[devotionalId];
    },
    [store.completedAt]
  );

  return (
    <CompletionContext.Provider
      value={{
        completedIds: store.completedIds,
        isLoading,
        isComplete,
        toggleComplete,
        completedAt,
      }}
    >
      {children}
    </CompletionContext.Provider>
  );
};
