import type { Store } from '@/domain/types';

export const DEMO_STORE: Store = {
  id: 'store_udoma',
  name: 'Магазин «У дома»',
  address: 'ул. Примерная, 1',
  qr: 'VTBGO-STORE-UDOMA',
  scenario: 'scan_and_go',
};

export const STORES: Store[] = [DEMO_STORE];

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
