import type { Cart, CartItem } from './types';

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
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
  const prevMap = new Map(previous.items.map((item) => [item.barcode, item]));
  const nextMap = new Map(next.items.map((item) => [item.barcode, item]));

  const added: CartItem[] = [];
  const removed: CartItem[] = [];
  const qtyChanged: QtyChange[] = [];

  for (const item of next.items) {
    const prev = prevMap.get(item.barcode);
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
    if (!nextMap.has(item.barcode)) {
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
