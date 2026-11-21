import type { StoreTillExchange } from '@/domain/types';

const PII_KEYS = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'cardPan',
  'cardCvv',
  'cardLast4',
  'profileId',
  'birthDate',
  'address',
] as const;

const PII_SNIPPETS = [
  'Анна',
  'Соколова',
  '+7 916',
  'anna.sokolova',
  '2200123456781234',
  '847',
  '1234',
] as const;

/** Проверяет, что в сериализованном конверте нет явных полей и типичных значений ПДн. */
export function assertStoreTillExchange(exchange: StoreTillExchange): void {
  const json = JSON.stringify(exchange) as string;
  const record = exchange as unknown as Record<string, unknown>;

  for (const key of PII_KEYS) {
    if (key in record) {
      throw new Error(`Store till exchange must not include field "${key}"`);
    }
  }

  for (const key of Object.keys(record)) {
    if (PII_KEYS.includes(key as (typeof PII_KEYS)[number])) {
      throw new Error(`Store till exchange must not include field "${key}"`);
    }
  }

  for (const snippet of PII_SNIPPETS) {
    if (json.includes(snippet)) {
      throw new Error(`Store till exchange must not leak PII snippet "${snippet}"`);
    }
  }
}