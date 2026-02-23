import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingStore } from '../types';

const STORAGE_KEY = '@pasture/onboarding';

const defaultStore: OnboardingStore = {
  completed: false,
  userName: '',
  churchCode: '',
};

export const load = async (): Promise<OnboardingStore> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore;
  return JSON.parse(raw) as OnboardingStore;
};

export const save = async (store: OnboardingStore): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};
