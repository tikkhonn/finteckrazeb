import type {
  Consent,
  DomainEvent,
  Payment,
  PaymentStatus,
  Receipt,
  Refund,
  RiskCheck,
  Session,
  StoreTillExchange,
  UserRiskState,
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
  riskChecks?: Record<string, RiskCheck>;
  userRiskByProfile?: Record<string, UserRiskState>;
  storeTillBySession?: Record<string, StoreTillExchange>;
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
    riskChecks: {},
    userRiskByProfile: {},
    storeTillBySession: {},
  };
}

export function cloneState(state: MockState): MockState {
  return JSON.parse(JSON.stringify(state)) as MockState;
}
