import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReflectionsStore, DevotionalAnswers } from '../types';

const STORAGE_KEY = '@pasture/reflections';

const defaultStore: ReflectionsStore = {
  answers: {},
  sharedIds: [],
};

export const load = async (): Promise<ReflectionsStore> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore;
  return JSON.parse(raw) as ReflectionsStore;
};

export const save = async (store: ReflectionsStore): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getAnswers = async (
  devotionalId: string
): Promise<DevotionalAnswers | undefined> => {
  const store = await load();
  return store.answers[devotionalId];
};

export const saveAnswer = async (
  devotionalId: string,
  questionIndex: number,
  text: string
): Promise<ReflectionsStore> => {
  const store = await load();
  const existing = store.answers[devotionalId] ?? {
    devotionalId,
    answers: {},
    lastModified: new Date().toISOString(),
  };
  existing.answers[questionIndex] = text;
  existing.lastModified = new Date().toISOString();
  store.answers[devotionalId] = existing;
  await save(store);
  return store;
};

export const markShared = async (sharedId: string): Promise<ReflectionsStore> => {
  const store = await load();
  if (!store.sharedIds.includes(sharedId)) {
    store.sharedIds.push(sharedId);
    await save(store);
  }
  return store;
};
