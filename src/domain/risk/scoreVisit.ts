import { lineAmount } from '@/domain/cart';
import type { ProfileId } from '@/domain/profile';
import type { CartItem, RiskCheck, RiskLevel, UserRiskState } from '@/domain/types';

export const AUDIT_RATE_BASE = 0.05;
export const AUDIT_RATE_DECAY = 0.015;
export const AUDIT_DECAY_VISITS = 5;
export const MONITORING_VISITS_AFTER_MISMATCH = 3;

export const TIME_IN_STORE_MS = 20_000;
export const FAST_CHECKOUT_MIN_TOTAL = 500;
export const REMOVED_ITEM_MIN_PRICE = 200;

export const CUSTOMER_SPOT_CHECK_NOTICE =
  'Быстрая сверка 2 позиций на зоне КСО без очереди (5 секунд)';

export interface RemovedLine {
  name: string;
  unitPrice: number;
}

export interface ScoreVisitInput {
  profileId: ProfileId;
  startedAt: number;
  now: number;
  cartItems: CartItem[];
  cartTotal: number;
  removedLines: RemovedLine[];
  userRisk: UserRiskState;
  rng: number;
}

export interface ScoreVisitResult {
  check: RiskCheck;
  nextUserRisk: UserRiskState;
}

function emptyUserRisk(profileId: ProfileId): UserRiskState {
  return {
    profileId,
    softDecayRemaining: 0,
    monitoringVisitsRemaining: 0,
    mismatchCount: 0,
    forceCheck: false,
  };
}

export function normalizeUserRisk(profileId: ProfileId, state?: UserRiskState): UserRiskState {
  if (!state || state.profileId !== profileId) {
    return emptyUserRisk(profileId);
  }
  return { ...state };
}

export function auditRate(state: UserRiskState): number {
  if (state.forceCheck) {
    return 1;
  }
  if (state.softDecayRemaining > 0) {
    return AUDIT_RATE_DECAY;
  }
  return AUDIT_RATE_BASE;
}

function maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  const rank: Record<RiskLevel, number> = { clear: 0, yellow: 1, red: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function cartHasAdult(cartItems: CartItem[]): boolean {
  return cartItems.some((item) => item.isAdultOnly === true);
}

function removedExpensiveStillOut(cartItems: CartItem[], removed: RemovedLine[]): boolean {
  if (removed.length === 0) {
    return false;
  }
  const inCart = new Set(cartItems.map((item) => item.name));
  return removed.some((line) => line.unitPrice >= REMOVED_ITEM_MIN_PRICE && !inCart.has(line.name));
}

export function pickSpotCheckItems(cartItems: CartItem[]): RiskCheck['spotItems'] {
  const adults = cartItems.filter((item) => item.isAdultOnly === true);
  const pool = adults.length > 0 ? adults : [...cartItems];
  const ranked = pool
    .map((item) => ({
      name: item.name,
      qty: item.qty,
      amount: lineAmount(item),
    }))
    .sort((a, b) => b.amount - a.amount);
  return ranked.slice(0, 2);
}

export function scorePaymentVisit(input: ScoreVisitInput): ScoreVisitResult {
  const userRisk = { ...input.userRisk };
  const reasons: string[] = [];
  let level: RiskLevel = 'clear';

  const dwellMs = input.now - input.startedAt;
  const timeTrigger = dwellMs < TIME_IN_STORE_MS && input.cartTotal >= FAST_CHECKOUT_MIN_TOTAL;
  const removedTrigger = removedExpensiveStillOut(input.cartItems, input.removedLines);
  const adultTrigger = cartHasAdult(input.cartItems);

  if (timeTrigger) {
    level = maxLevel(level, 'red');
    reasons.push('Короткое время в зале при крупном чеке');
  }

  if (removedTrigger) {
    level = maxLevel(level, 'red');
    reasons.push('Удалена дорогая позиция перед оплатой');
  }

  if (adultTrigger) {
    level = maxLevel(level, 'yellow');
    reasons.push('В чеке товар 18+');
  }

  const behavioralTrigger = timeTrigger || removedTrigger || adultTrigger;
  const forcedAudit = userRisk.forceCheck;

  const monitoringOnly =
    userRisk.monitoringVisitsRemaining > 0 && !behavioralTrigger && !forcedAudit;
  if (monitoringOnly) {
    level = maxLevel(level, 'yellow');
    reasons.push('Повышенный мониторинг после прошлой сверки');
  }

  const auditHit = input.rng < auditRate(userRisk);
  const backgroundAudit = !forcedAudit && auditHit && !behavioralTrigger && !monitoringOnly;

  if (forcedAudit) {
    level = maxLevel(level, 'yellow');
    reasons.push('Принудительная сверка по банковскому ID');
  } else if (backgroundAudit) {
    level = maxLevel(level, 'yellow');
    reasons.push('Фоновый аудит');
  }

  const attentionRequired = forcedAudit || monitoringOnly || behavioralTrigger || backgroundAudit;
  const customerNotice = forcedAudit || behavioralTrigger || backgroundAudit;

  const nextUserRisk = { ...userRisk };
  if (nextUserRisk.softDecayRemaining > 0) {
    nextUserRisk.softDecayRemaining -= 1;
  }
  if (nextUserRisk.monitoringVisitsRemaining > 0) {
    nextUserRisk.monitoringVisitsRemaining -= 1;
  }

  const check: RiskCheck = {
    sessionId: '',
    profileId: input.profileId,
    level,
    reasons,
    customerNotice,
    attentionRequired,
    monitoringOnly: monitoringOnly && !behavioralTrigger && !forcedAudit,
    spotItems: pickSpotCheckItems(input.cartItems),
    itemCount: input.cartItems.reduce((sum, item) => sum + item.qty, 0),
    total: input.cartTotal,
    paidAt: input.now,
    resolved: attentionRequired ? 'pending' : 'ok',
  };

  return { check, nextUserRisk };
}

export function applyCheckOk(profileId: ProfileId, state?: UserRiskState): UserRiskState {
  const next = normalizeUserRisk(profileId, state);
  if (next.forceCheck) {
    return next;
  }
  return {
    ...next,
    softDecayRemaining: AUDIT_DECAY_VISITS,
  };
}

export function applyMismatch(profileId: ProfileId, state?: UserRiskState): UserRiskState {
  const next = normalizeUserRisk(profileId, state);
  const mismatchCount = next.mismatchCount + 1;
  if (mismatchCount === 1) {
    return {
      ...next,
      mismatchCount,
      monitoringVisitsRemaining: MONITORING_VISITS_AFTER_MISMATCH,
      softDecayRemaining: 0,
    };
  }
  return {
    ...next,
    mismatchCount,
    forceCheck: true,
    softDecayRemaining: 0,
    monitoringVisitsRemaining: 0,
  };
}