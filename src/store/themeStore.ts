import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';

import { parsePreference, type ThemePreference } from '@/domain/theme';

const STORAGE_KEY = 'vtbgo.theme.v1';

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
}

function applyNativeScheme(preference: ThemePreference) {
  try {
    if (typeof Appearance.setColorScheme !== 'function') {
      return;
    }
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  } catch {
    // Appearance.setColorScheme отсутствует в части тестовых окружений.
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const preference = parsePreference(raw);
    applyNativeScheme(preference);
    set({ preference, hydrated: true });
  },
  setPreference: (preference) => {
    applyNativeScheme(preference);
    void AsyncStorage.setItem(STORAGE_KEY, preference);
    set({ preference });
  },
}));

export async function hydrateTheme(): Promise<void> {
  await useThemeStore.getState().hydrate();
}
