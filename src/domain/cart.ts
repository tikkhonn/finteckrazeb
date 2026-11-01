import { formatRub } from './money';
import type { Cart, CartItem, PaymentMethod } from './types';

export function lineAmount(item: Pick<CartItem, 'unitPrice' | 'qty' | 'weightKg'>): number {
  if (typeof item.weightKg === 'number') {
    return Math.round(item.unitPrice * item.weightKg);
  }
  return Math.round(item.unitPrice * item.qty * 100) / 100;
}

export function itemCashbackRate(item: Pick<CartItem, 'cashbackRate'>): number {
  return item.cashbackRate ?? 0.05;
}

/** Кешбэк корзины: сумма строк × ставка, затем коэффициент способа оплаты, одно округление. */
export function basketCashback(items: CartItem[], method: PaymentMethod): number {
  const factor = method === 'card' ? 1 : method === 'digital_ruble' ? 0.5 : 0;
  if (factor === 0) {
    return 0;
  }
  const raw = items.reduce((sum, item) => sum + lineAmount(item) * itemCashbackRate(item), 0);
  return Math.round(raw * factor);
}

export function withLineCashback(item: CartItem): CartItem {
  const next: CartItem = {
    ...item,
    exciseCodes: item.exciseCodes ?? [],
  };
  next.calculatedCashback = lineAmount(next) * itemCashbackRate(next);
  return next;
}

export function formatWeightLine(item: Pick<CartItem, 'unitPrice' | 'weightKg'>): string | null {
  if (typeof item.weightKg !== 'number') {
    return null;
  }
  const amount = Math.round(item.unitPrice * item.weightKg);
  return `${item.weightKg.toFixed(3)} кг × ${formatRub(item.unitPrice)}/кг = ${formatRub(amount)}`;
}

export function cartTotal(items: CartItem[]): number {
  const sum = items.reduce((total, item) => total + lineAmount(item), 0);
  return Math.round(sum * 100) / 100;
}

export function withTotals(items: CartItem[], version: number): Cart {
  return {
    items,
    total: cartTotal(items),
    version,
  };
}

export interface QtyChange {
  barcode: string;
  name: string;
  oldQty: number;
  newQty: number;
  unitPrice: number;
}

export interface CartDiff {
  added: CartItem[];
  removed: CartItem[];
  qtyChanged: QtyChange[];
  oldTotal: number;
  newTotal: number;
  oldVersion: number;
  newVersion: number;
}

export function diffCarts(previous: Cart, next: Cart): CartDiff {
  const prevMap = new Map(previous.items.map((item) => [item.id, item]));
  const nextMap = new Map(next.items.map((item) => [item.id, item]));

  const added: CartItem[] = [];
  const removed: CartItem[] = [];
  const qtyChanged: QtyChange[] = [];

  for (const item of next.items) {
    const prev = prevMap.get(item.id);
    if (!prev) {
      added.push(item);
    } else if (prev.qty !== item.qty) {
      qtyChanged.push({
        barcode: item.barcode,
        name: item.name,
        oldQty: prev.qty,
        newQty: item.qty,
        unitPrice: item.unitPrice,
      });
    }
  }

  for (const item of previous.items) {
    if (!nextMap.has(item.id)) {
      removed.push(item);
    }
  }

  return {
    added,
    removed,
    qtyChanged,
    oldTotal: previous.total,
    newTotal: next.total,
    oldVersion: previous.version,
    newVersion: next.version,
  };
}

export function isCartChanged(diff: CartDiff): boolean {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.qtyChanged.length > 0;
}
