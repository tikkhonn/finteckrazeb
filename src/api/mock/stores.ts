import type { Store } from '@/domain/types';

export const STORES: Store[] = [
  {
    id: 'store_udoma',
    name: 'Магазин «У дома»',
    address: 'ул. Примерная, 1',
    qr: 'VTBGO-STORE-UDOMA',
    scenario: 'scan_and_go',
    distanceM: 120,
  },
  {
    id: 'store_green',
    name: 'Green Market',
    address: 'Невский пр., 24',
    qr: 'VTBGO-STORE-GREEN',
    scenario: 'scan_and_go',
    distanceM: 340,
  },
  {
    id: 'store_prod24',
    name: 'Продукты 24',
    address: 'ул. Рубинштейна, 7',
    qr: 'VTBGO-STORE-PROD24',
    scenario: 'scan_and_go',
    distanceM: 560,
  },
  {
    id: 'store_lavka',
    name: 'Лавка у метро',
    address: 'Литейный пр., 51',
    qr: 'VTBGO-STORE-LAVKA',
    scenario: 'scan_and_go',
    distanceM: 870,
  },
  {
    id: 'store_fresh',
    name: 'Fresh Point',
    address: 'ул. Марата, 12',
    qr: 'VTBGO-STORE-FRESH',
    scenario: 'scan_and_go',
    distanceM: 1250,
  },
];

export const DEMO_STORE = STORES[0];

export function findStoreById(id: string): Store | undefined {
  return STORES.find((store) => store.id === id);
}

export function nearestStores(limit = 3): Store[] {
  return [...STORES].sort((a, b) => a.distanceM - b.distanceM).slice(0, limit);
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters} м` : `${(meters / 1000).toFixed(1).replace('.', ',')} км`;
}

export type StoreFeature = 'Scan & Go' | 'Take & Go';

export interface MapPin {
  id: string;
  name: string;
  address: string;
  feature: StoreFeature;
  x: number;
  y: number;
}

const PIN_POSITIONS: Record<string, Pick<MapPin, 'x' | 'y'>> = {
  store_udoma: { x: 0.32, y: 0.4 },
  store_green: { x: 0.68, y: 0.28 },
  store_prod24: { x: 0.2, y: 0.78 },
  store_lavka: { x: 0.82, y: 0.6 },
  store_fresh: { x: 0.12, y: 0.18 },
};

export const MAP_PINS: MapPin[] = [
  ...STORES.map((store) => ({
    id: store.id,
    name: store.name,
    address: store.address,
    feature: 'Scan & Go' as const,
    ...PIN_POSITIONS[store.id],
  })),
  {
    id: 'pin_box',
    name: 'Box 24',
    address: 'ул. Садовая, 9',
    feature: 'Take & Go',
    x: 0.52,
    y: 0.7,
  },
];

export function findStoreByQr(raw: string): Store | undefined {
  const value = raw.trim();
  return STORES.find(
    (store) =>
      store.qr === value ||
      store.id === value ||
      value === `vtbgo://store/${store.id}` ||
      value.endsWith(store.qr),
  );
}
