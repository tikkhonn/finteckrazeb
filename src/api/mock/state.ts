import type {
  Consent,
  DomainEvent,
  Payment,
  PaymentStatus,
  Receipt,
  Refund,
  Session,
} from '@/domain/types';

export interface MockState {
  seq: number;
  sessions: Record<string, Session>;
  payments: Record<string, Payment>;
  receipts: Record<string, Receipt>;
  refunds: Record<string, Refund>;
  consents: Record<string, Consent>;
  events: DomainEvent[];
  idempotency: Record<string, string>;
  hiddenOutcomes: Record<string, PaymentStatus>;
}

export function emptyState(): MockState {
  return {
    seq: 0,
    sessions: {},
    payments: {},
    receipts: {},
    refunds: {},
    consents: {},
    events: [],
    idempotency: {},
    hiddenOutcomes: {},
  };
}

export function cloneState(state: MockState): MockState {
  return JSON.parse(JSON.stringify(state)) as MockState;
}
