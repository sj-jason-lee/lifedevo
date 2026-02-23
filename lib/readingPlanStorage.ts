import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingPlanStore } from '../types';

const STORAGE_KEY = '@pasture/reading-plan';

const defaultStore: ReadingPlanStore = {
  completedDays: {},
  completedDayAt: {},
};

export const load = async (): Promise<ReadingPlanStore> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore;
  return JSON.parse(raw) as ReadingPlanStore;
};

export const save = async (store: ReadingPlanStore): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};
