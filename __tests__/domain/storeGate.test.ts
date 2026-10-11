import { findStoreByQr, nearestStores } from '@/api/mock/stores';
import { VtbGoError } from '@/domain/errors';
import { assertStoreMatches } from '@/domain/storeGate';

describe('assertStoreMatches', () => {
  const green = findStoreByQr('VTBGO-STORE-GREEN')!;

  it('пропускает QR выбранного магазина', () => {
    expect(assertStoreMatches(green, 'store_green')).toBe(green);
  });

  it('пропускает любой магазин, если точка не выбрана', () => {
    expect(assertStoreMatches(green)).toBe(green);
  });

  it('отклоняет QR другой точки', () => {
    try {
      assertStoreMatches(green, 'store_udoma');
      throw new Error('должно было упасть');
    } catch (error) {
      expect(error).toBeInstanceOf(VtbGoError);
      expect((error as VtbGoError).code).toBe('STORE_MISMATCH');
    }
  });
});

describe('nearestStores', () => {
  it('возвращает три ближайшие точки, «У дома» первая', () => {
    const stores = nearestStores(3);
    expect(stores).toHaveLength(3);
    expect(stores[0].id).toBe('store_udoma');
    expect(stores.map((store) => store.distanceM)).toEqual(
      [...stores.map((store) => store.distanceM)].sort((a, b) => a - b),
    );
  });
});
