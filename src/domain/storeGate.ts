import { VtbGoError } from './errors';
import type { Store } from './types';

export function assertStoreMatches(scanned: Store, expectedStoreId?: string): Store {
  if (expectedStoreId && scanned.id !== expectedStoreId) {
    throw new VtbGoError(
      'STORE_MISMATCH',
      `Это QR другой торговой точки (${scanned.name}). Отсканируйте QR на входе выбранного магазина.`,
    );
  }
  return scanned;
}
