import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CatalogItem } from '@/domain/types';

const STORAGE_KEY = 'vtbgo.catalog.v1';

/** Returns `null` until the catalog has been edited at least once. */
export async function loadCatalog(): Promise<CatalogItem[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CatalogItem[];
  } catch {
    return null;
  }
}

export async function saveCatalog(catalog: CatalogItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
}

export async function clearCatalog(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
