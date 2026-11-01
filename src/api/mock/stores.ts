import type { Store } from '@/domain/types';

import { placeCoordinate, walkingMeters, type LatLng } from './mapGeo';

export const STORES: Store[] = [
  {
    id: 'store_udoma',
    name: 'Магазин «У дома»',
    address: 'Невский пр., 68',
    qr: 'VTBGO-STORE-UDOMA',
    scenario: 'scan_and_go',
    distanceM: walkingMeters('store_udoma'),
  },
  {
    id: 'store_green',
    name: 'Green Market',
    address: 'Невский пр., 24',
    qr: 'VTBGO-STORE-GREEN',
    scenario: 'scan_and_go',
    distanceM: walkingMeters('store_green'),
  },
  {
    id: 'store_prod24',
    name: 'Продукты 24',
    address: 'ул. Рубинштейна, 7',
    qr: 'VTBGO-STORE-PROD24',
    scenario: 'scan_and_go',
    distanceM: walkingMeters('store_prod24'),
  },
  {
    id: 'store_lavka',
    name: 'Лавка у метро',
    address: 'Литейный пр., 51',
    qr: 'VTBGO-STORE-LAVKA',
    scenario: 'scan_and_go',
    distanceM: walkingMeters('store_lavka'),
  },
  {
    id: 'store_fresh',
    name: 'Fresh Point',
    address: 'ул. Марата, 12',
    qr: 'VTBGO-STORE-FRESH',
    scenario: 'scan_and_go',
    distanceM: walkingMeters('store_fresh'),
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
  coordinate: LatLng;
  distanceM: number;
}

function pinFromNode(
  id: string,
  info: { name: string; address: string; feature: StoreFeature },
): MapPin {
  return {
    id,
    ...info,
    coordinate: placeCoordinate(id),
    distanceM: walkingMeters(id),
  };
}

export const MAP_PINS: MapPin[] = [
  ...STORES.map((store) =>
    pinFromNode(store.id, {
      name: store.name,
      address: store.address,
      feature: 'Scan & Go',
    }),
  ),
  pinFromNode('pin_box', {
    name: 'Box 24',
    address: 'ул. Садовая, 9',
    feature: 'Take & Go',
  }),
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
