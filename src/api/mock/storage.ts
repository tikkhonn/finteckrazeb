import AsyncStorage from '@react-native-async-storage/async-storage';

import { cloneState, emptyState, type MockState } from './state';

const STORAGE_KEY = 'vtbgo.mock.v1';

export async function loadState(): Promise<MockState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyState();
  }
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    return emptyState();
  }
}

export async function saveState(state: MockState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cloneState(state)));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
