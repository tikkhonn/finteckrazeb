import { normalizeEan13 } from '@/domain/ean';

export type ParsedCode =
  | { type: 'catalog_qr' }
  | { type: 'catalog_url'; storeKey: string; url: string }
  | { type: 'store_qr'; code: string }
  | { type: 'gs1'; ean13: string; exciseCode: string }
  | { type: 'weighted'; ean13: string; pluCode: string; weightKg: number }
  | { type: 'ean13'; ean13: string }
  | { type: 'unknown' };

const GS1 = /^01(\d{14})21([!-~]{6,20})$/;
const DB50 = 'VTBGO-STORE-DB50';

/** GS1 DataMatrix: GTIN-14 после `01`, серийный номер после `21`. Ведущий 0 у GTIN отрезается. */
export function ean13FromGtin(gtin14: string): string {
  return gtin14.startsWith('0') ? gtin14.slice(1) : gtin14.slice(0, 13);
}

export function demoExciseMark(ean13: string, now = Date.now()): string {
  const gtin = ean13.length === 13 ? `0${ean13}` : ean13.padStart(14, '0');
  return `01${gtin}21DEMO-${now}`;
}

export function parseScannedCode(raw: string): ParsedCode {
  const value = raw.trim();
  if (!value) {
    return { type: 'unknown' };
  }

  if (value.toUpperCase() === DB50) {
    return { type: 'catalog_qr' };
  }

  const catalogUrl = parseCatalogUrl(value);
  if (catalogUrl) {
    return { type: 'catalog_url', ...catalogUrl };
  }

  const lower = value.toLowerCase();
  if (lower.startsWith('vtbgo-store-') || lower.startsWith('vtbgo://store/')) {
    return { type: 'store_qr', code: value };
  }

  const gs1 = value.match(GS1);
  const gtin = gs1?.[1];
  if (gtin) {
    return { type: 'gs1', ean13: ean13FromGtin(gtin), exciseCode: value };
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length === 13) {
    const prefix = Number(digits.slice(0, 2));
    if (prefix >= 20 && prefix <= 29) {
      const grams = Number.parseInt(digits.slice(7, 12), 10);
      return {
        type: 'weighted',
        ean13: digits,
        pluCode: digits.slice(2, 7),
        weightKg: grams / 1000,
      };
    }
  }

  const ean13 = normalizeEan13(value);
  if (ean13) {
    return { type: 'ean13', ean13 };
  }

  return { type: 'unknown' };
}

export function parseCatalogUrl(raw: string): { storeKey: string; url: string } | null {
  const value = raw.trim();
  if (!value.toLowerCase().startsWith('vtbgo://catalog')) {
    return null;
  }
  let url = '';
  let storeKey = 'CUSTOM';
  try {
    const parsed = new URL(value);
    url = parsed.searchParams.get('url') ?? '';
    storeKey = parsed.searchParams.get('store') ?? 'CUSTOM';
  } catch {
    return null;
  }
  if (!url) {
    return null;
  }
  return { storeKey, url };
}

export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
