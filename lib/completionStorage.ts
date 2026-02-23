import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CompletionStore } from '../types';

const STORAGE_KEY = '@pasture/completions';

const defaultStore: CompletionStore = {
  completedIds: [],
  completedAt: {},
};

export const load = async (): Promise<CompletionStore> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore;
  return JSON.parse(raw) as CompletionStore;
};

export const save = async (store: CompletionStore): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};
