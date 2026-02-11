import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Church,
  JournalEntry,
  Prayer,
  DevotionalCompletion,
} from '../types';

const KEYS = {
  USER: '@lifedevo/user',
  CHURCH: '@lifedevo/church',
  IS_AUTHENTICATED: '@lifedevo/isAuthenticated',
  JOURNAL_ENTRIES: '@lifedevo/journalEntries',
  PRAYERS: '@lifedevo/prayers',
  COMPLETIONS: '@lifedevo/completions',
  LOCAL_CHURCHES: '@lifedevo/localChurches',
} as const;

export interface PersistedState {
  user: User | null;
  church: Church | null;
  isAuthenticated: boolean;
  journalEntries: JournalEntry[];
  prayers: Prayer[];
  completions: DevotionalCompletion[];
}

async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('AsyncStorage write failed:', key, e);
  }
}

async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.warn('AsyncStorage read failed:', key, e);
    return null;
  }
}

export async function loadPersistedState(): Promise<Partial<PersistedState>> {
  const [user, church, isAuthenticated, journalEntries, prayers, completions] =
    await Promise.all([
      getJSON<User>(KEYS.USER),
      getJSON<Church>(KEYS.CHURCH),
      getJSON<boolean>(KEYS.IS_AUTHENTICATED),
      getJSON<JournalEntry[]>(KEYS.JOURNAL_ENTRIES),
      getJSON<Prayer[]>(KEYS.PRAYERS),
      getJSON<DevotionalCompletion[]>(KEYS.COMPLETIONS),
    ]);

  const result: Partial<PersistedState> = {};
  if (user !== null) result.user = user;
  if (church !== null) result.church = church;
  if (isAuthenticated !== null) result.isAuthenticated = isAuthenticated;
  if (journalEntries !== null) result.journalEntries = journalEntries;
  if (prayers !== null) result.prayers = prayers;
  if (completions !== null) result.completions = completions;

  return result;
}

export async function persistUser(user: User | null): Promise<void> {
  await setJSON(KEYS.USER, user);
}

export async function persistChurch(church: Church | null): Promise<void> {
  await setJSON(KEYS.CHURCH, church);
}

export async function persistAuth(isAuthenticated: boolean): Promise<void> {
  await setJSON(KEYS.IS_AUTHENTICATED, isAuthenticated);
}

export async function persistJournalEntries(entries: JournalEntry[]): Promise<void> {
  await setJSON(KEYS.JOURNAL_ENTRIES, entries);
}

export async function persistPrayers(prayers: Prayer[]): Promise<void> {
  await setJSON(KEYS.PRAYERS, prayers);
}

export async function persistCompletions(completions: DevotionalCompletion[]): Promise<void> {
  await setJSON(KEYS.COMPLETIONS, completions);
}

export async function saveLocalChurch(church: Church): Promise<void> {
  const existing = await getJSON<Church[]>(KEYS.LOCAL_CHURCHES) || [];
  const updated = existing.filter((c) => c.id !== church.id);
  updated.push(church);
  await setJSON(KEYS.LOCAL_CHURCHES, updated);
}

export async function findLocalChurchByCode(inviteCode: string): Promise<Church | null> {
  const churches = await getJSON<Church[]>(KEYS.LOCAL_CHURCHES) || [];
  return churches.find((c) => c.inviteCode.toUpperCase() === inviteCode.toUpperCase()) || null;
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (e) {
    console.warn('AsyncStorage clear failed:', e);
  }
}
