import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimeSet } from './engine';

const KEY = 'timesets_v1';

export async function loadSets(): Promise<TimeSet[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TimeSet[]) : [];
  } catch {
    return [];
  }
}

export async function saveSets(sets: TimeSet[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sets));
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
