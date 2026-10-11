import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'vtbgo.certs.v1';

export type OrderedCert = {
  id: string;
  certId: string;
  title: string;
  at: number;
};

function parseOrdered(raw: unknown): OrderedCert[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is OrderedCert => {
    return (
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as OrderedCert).id === 'string' &&
      typeof (item as OrderedCert).certId === 'string' &&
      typeof (item as OrderedCert).title === 'string' &&
      typeof (item as OrderedCert).at === 'number'
    );
  });
}

interface CertsState {
  ordered: OrderedCert[];
  hydrate: () => Promise<void>;
  order: (certId: string, title: string) => OrderedCert;
}

export const useCertsStore = create<CertsState>((set, get) => ({
  ordered: [],
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      set({ ordered: parseOrdered(JSON.parse(raw) as unknown) });
    } catch {
      set({ ordered: [] });
    }
  },
  order: (certId, title) => {
    const item: OrderedCert = {
      id: `ord_${Date.now()}`,
      certId,
      title,
      at: Date.now(),
    };
    const ordered = [item, ...get().ordered];
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
    set({ ordered });
    return item;
  },
}));

export async function hydrateCerts(): Promise<void> {
  await useCertsStore.getState().hydrate();
}
