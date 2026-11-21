import type { CartItem, StoreTillExchange, StoreTillLine } from '@/domain/types';
import { assertStoreTillExchange } from '@/domain/storeTillGuard';

/** Кассовый обмен по 152-ФЗ: без профиля покупателя, только сессия и строки корзины. */
export function buildStoreTillExchange(sessionToken: string, cartItems: CartItem[]): StoreTillExchange {
  const items: StoreTillLine[] = cartItems.map((item) => ({
    sku: item.barcode,
    qty: item.qty,
    price: item.unitPrice,
    ...(typeof item.weightKg === 'number' ? { weightKg: item.weightKg } : {}),
  }));

  const exchange: StoreTillExchange = {
    sessionToken,
    items,
    status: 'PAID',
  };

  assertStoreTillExchange(exchange);
  return exchange;
}