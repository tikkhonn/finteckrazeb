import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'vtbgo.prefs.v1';

type Prefs = {
  faceIdEnabled: boolean;
  hideBalances: boolean;
};

const DEFAULTS: Prefs = {
  faceIdEnabled: true,
  hideBalances: false,
};

function parsePrefs(raw: unknown): Prefs {
  if (!raw || typeof raw !== 'object') {
    return DEFAULTS;
  }
  const value = raw as Record<string, unknown>;
  return {
    faceIdEnabled: value.faceIdEnabled !== false,
    hideBalances: value.hideBalances === true,
  };
}

interface PrefsState extends Prefs {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setFaceIdEnabled: (value: boolean) => void;
  setHideBalances: (value: boolean) => void;
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hydrated: true });
      return;
    }
    try {
      set({ ...parsePrefs(JSON.parse(raw) as unknown), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  setFaceIdEnabled: (faceIdEnabled) => {
    const next = { faceIdEnabled, hideBalances: get().hideBalances };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ faceIdEnabled });
  },
  setHideBalances: (hideBalances) => {
    const next = { faceIdEnabled: get().faceIdEnabled, hideBalances };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ hideBalances });
  },
}));

export async function hydratePrefs(): Promise<void> {
  await usePrefsStore.getState().hydrate();
}
