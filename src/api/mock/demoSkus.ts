import products50 from './products50.json';

import { demoExciseMark } from '@/domain/scanner/barcodeParser';
import type { CatalogItem } from '@/domain/types';

const rows = products50 as unknown as CatalogItem[];

export const DEMO_COLA = rows.find((item) => item.barcode === '4607086560213') as CatalogItem;
export const DEMO_WATER = rows.find((item) => item.barcode === '4609900000019') as CatalogItem;
export const DEMO_ENERGY = rows.find((item) => item.barcode === '4609900000118') as CatalogItem;
export const DEMO_APPLES = rows.find((item) => item.pluCode === '00105') as CatalogItem;

/** Этикетка весов из ТЗ: PLU 00105, 450 г. Контрольная цифра демонстрационная. */
export const APPLE_SCALE_CODE = '2100105004509';

export function payloadForDemo(item: CatalogItem, now = Date.now()): string {
  if (item.requiresExcise) {
    return demoExciseMark(item.barcode, now);
  }
  if (item.pluCode === DEMO_APPLES.pluCode) {
    return APPLE_SCALE_CODE;
  }
  if (item.isWeighted && item.pluCode) {
    return `21${item.pluCode}004500`;
  }
  return item.barcode;
}
