import { MockEngine } from '@/api/mock/engine';
import { DEMO_COLA, DEMO_ENERGY } from '@/api/mock/demoSkus';
import { demoExciseMark } from '@/domain/scanner/barcodeParser';
import type { CartItem } from '@/domain/types';
import {
  AUDIT_DECAY_VISITS,
  AUDIT_RATE_BASE,
  AUDIT_RATE_DECAY,
  MONITORING_VISITS_AFTER_MISMATCH,
  applyCheckOk,
  applyMismatch,
  auditRate,
  normalizeUserRisk,
  scorePaymentVisit,
} from '@/domain/risk/scoreVisit';

const baseItem: CartItem = {
  id: 'i1',
  barcode: '4607086560213',
  name: 'Cola',
  unitPrice: 149,
  qty: 1,
  addedBy: 'customer',
  exciseCodes: ['mark'],
  calculatedCashback: 0,
};

const adultItem: CartItem = {
  ...baseItem,
  id: 'i2',
  name: DEMO_ENERGY.name,
  barcode: DEMO_ENERGY.barcode,
  unitPrice: DEMO_ENERGY.price,
  isAdultOnly: true,
  exciseCodes: [demoExciseMark(DEMO_ENERGY.barcode)],
};

function score(profileId: 'anna' | 'dmitry' | 'maria', rng: number, overrides?: Partial<Parameters<typeof scorePaymentVisit>[0]>) {
  const now = 1_700_000_050_000;
  const userRisk = normalizeUserRisk(profileId, overrides?.userRisk);
  return scorePaymentVisit({
    profileId,
    startedAt: now - 120_000,
    now,
    cartItems: [baseItem],
    cartTotal: 149,
    removedLines: [],
    userRisk,
    rng,
    ...overrides,
  });
}

describe('scorePaymentVisit', () => {
  it('ставка фонового аудита: 5%, 1,5% и принудительная', () => {
    expect(auditRate(normalizeUserRisk('anna'))).toBe(AUDIT_RATE_BASE);
    expect(
      auditRate(
        normalizeUserRisk('anna', {
          profileId: 'anna',
          softDecayRemaining: 2,
          monitoringVisitsRemaining: 0,
          mismatchCount: 0,
          forceCheck: false,
        }),
      ),
    ).toBe(AUDIT_RATE_DECAY);
    expect(
      auditRate(
        normalizeUserRisk('anna', {
          profileId: 'anna',
          softDecayRemaining: 0,
          monitoringVisitsRemaining: 0,
          mismatchCount: 2,
          forceCheck: true,
        }),
      ),
    ).toBe(1);
  });

  it('фоновый аудит при rng ниже порога 5% и 1,5%', () => {
    expect(score('anna', 0.04).check.reasons).toContain('Фоновый аудит');
    const decayed = applyCheckOk('anna');
    expect(score('anna', 0.01, { userRisk: { ...decayed, softDecayRemaining: AUDIT_DECAY_VISITS } }).check.reasons).toContain(
      'Фоновый аудит',
    );
    expect(
      score('anna', 0.01, { userRisk: { ...decayed, softDecayRemaining: AUDIT_DECAY_VISITS } }).check.customerNotice,
    ).toBe(true);
    expect(score('anna', 0.99).check.customerNotice).toBe(false);
  });

  it('после пяти визитов с Soft Decay снова 5%', () => {
    let risk = applyCheckOk('anna');
    for (let i = 0; i < AUDIT_DECAY_VISITS; i += 1) {
      const result = score('anna', 0.99, { userRisk: risk });
      risk = result.nextUserRisk;
    }
    expect(auditRate(risk)).toBe(AUDIT_RATE_BASE);
  });

  it('короткое время в зале и удаление дорогой позиции — красный', () => {
    const fast = score('anna', 0.99, {
      startedAt: 1_700_000_000_000,
      now: 1_700_000_010_000,
      cartTotal: 600,
      cartItems: [{ ...baseItem, unitPrice: 600 }],
    });
    expect(fast.check.level).toBe('red');

    const removed = score('anna', 0.99, {
      removedLines: [{ name: 'Nutella', unitPrice: 289 }],
    });
    expect(removed.check.level).toBe('red');
    expect(removed.check.reasons).toContain('Удалена дорогая позиция перед оплатой');
  });

  it('18+ в чеке — жёлтый; маркированная кола без 18+ — без флага', () => {
    const adult = score('anna', 0.99, { cartItems: [adultItem], cartTotal: adultItem.unitPrice });
    expect(adult.check.level).toBe('yellow');
    expect(adult.check.customerNotice).toBe(true);

    const exciseOnly = score('anna', 0.99, { cartItems: [baseItem] });
    expect(exciseOnly.check.reasons).not.toContain('В чеке товар 18+');
  });

  it('первое расхождение — мониторинг 3 визита без плашки при чистом чеке', () => {
    let risk = applyMismatch('anna', normalizeUserRisk('anna'));
    expect(risk.monitoringVisitsRemaining).toBe(MONITORING_VISITS_AFTER_MISMATCH);

    const monitored = score('anna', 0.99, { userRisk: risk });
    expect(monitored.check.monitoringOnly).toBe(true);
    expect(monitored.check.customerNotice).toBe(false);
    expect(monitored.check.attentionRequired).toBe(true);
  });

  it('второе расхождение — принудительная сверка', () => {
    let risk = applyMismatch('anna');
    risk = applyMismatch('anna', risk);
    expect(risk.forceCheck).toBe(true);
    const forced = score('anna', 0.99, { userRisk: risk });
    expect(forced.check.customerNotice).toBe(true);
    expect(forced.check.reasons).toContain('Принудительная сверка по банковскому ID');
  });
});

const SIM = { paymentMode: 'success' as const, receiptMode: 'immediate' as const };
const NUTELLA = '3017620422003';
const KITKAT = '5000159407236';
const COFFEE = '7613036930468';
const PEAS = '4601780010089';

function engineWithRng(rngValue: number | (() => number), now = 1_700_000_000_000) {
  let clock = now;
  const rng = typeof rngValue === 'function' ? rngValue : () => rngValue;
  const engine = MockEngine.create({
    now: () => clock,
    getSim: () => SIM,
    getProfileId: () => 'anna',
    rng,
  });
  return {
    engine,
    advance: (ms: number) => {
      clock += ms;
    },
    pay: (sessionId: string, key: string) => {
      const session = engine.getSession(sessionId);
      return engine.pay(sessionId, {
        cartVersion: session.cart.version,
        method: 'card',
        idempotencyKey: key,
      });
    },
  };
}

describe('MockEngine risk', () => {
  it('пишет customerNotice в платёж и riskCheck в покупку', () => {
    const { engine, pay } = engineWithRng(0.99);
    engine.useCatalog('full');
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, demoExciseMark(DEMO_ENERGY.barcode));
    engine.finalizeCart(session.id);
    const payment = pay(session.id, 'once');
    const purchase = engine.getPurchase(session.id);
    expect(payment.customerNotice).toBe(true);
    expect(purchase.riskCheck?.reasons).toContain('В чеке товар 18+');
  });

  it('Soft Decay: после «Сверка ОК» 1,5%, затем снова 5% и фоновый аудит', () => {
    let roll = 0.04;
    const { engine, pay } = engineWithRng(() => roll);

    const auditSession = engine.startSession('store_udoma');
    engine.addItem(auditSession.id, KITKAT);
    engine.finalizeCart(auditSession.id);
    pay(auditSession.id, 'decay-audit');
    expect(engine.getPurchase(auditSession.id).riskCheck?.reasons).toContain('Фоновый аудит');
    engine.confirmRiskCheck(auditSession.id);

    roll = 0.03;
    const betweenSession = engine.startSession('store_udoma');
    engine.addItem(betweenSession.id, KITKAT);
    engine.finalizeCart(betweenSession.id);
    const betweenPay = pay(betweenSession.id, 'decay-between');
    expect(betweenPay.customerNotice).toBe(false);

    roll = 0.99;
    for (let i = 0; i < AUDIT_DECAY_VISITS - 1; i += 1) {
      const follow = engine.startSession('store_udoma');
      engine.addItem(follow.id, KITKAT);
      engine.finalizeCart(follow.id);
      pay(follow.id, `decay-burn-${i}`);
    }

    roll = 0.04;
    const backToBase = engine.startSession('store_udoma');
    engine.addItem(backToBase.id, KITKAT);
    engine.finalizeCart(backToBase.id);
    pay(backToBase.id, 'decay-base-again');
    expect(engine.getPurchase(backToBase.id).riskCheck?.reasons).toContain('Фоновый аудит');
  });

  it('мгновенная оплата крупного чека даёт красный триггер по времени', () => {
    const { engine, pay } = engineWithRng(0.99);
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, NUTELLA);
    engine.addItem(session.id, COFFEE);
    engine.addItem(session.id, NUTELLA);
    engine.finalizeCart(session.id);
    expect(engine.getSession(session.id).cart.total).toBeGreaterThanOrEqual(500);

    pay(session.id, 'fast-checkout');
    const risk = engine.getPurchase(session.id).riskCheck;
    expect(risk?.level).toBe('red');
    expect(risk?.reasons).toContain('Короткое время в зале при крупном чеке');
  });

  it('удаление Nutella перед оплатой — красный; кола с маркой без 18+ — нет', () => {
    const { engine, pay } = engineWithRng(0.99);

    const removedSession = engine.startSession('store_udoma');
    engine.addItem(removedSession.id, NUTELLA);
    const nutellaId = engine.getSession(removedSession.id).cart.items[0]!.id;
    engine.updateQty(removedSession.id, nutellaId, 0);
    engine.addItem(removedSession.id, KITKAT);
    engine.finalizeCart(removedSession.id);
    pay(removedSession.id, 'removed-expensive');
    const removedRisk = engine.getPurchase(removedSession.id).riskCheck;
    expect(removedRisk?.reasons).toContain('Удалена дорогая позиция перед оплатой');

    const { engine: exciseEngine, pay: payExcise } = engineWithRng(0.99);
    exciseEngine.useCatalog('full');
    const exciseSession = exciseEngine.startSession('store_udoma');
    exciseEngine.addItem(exciseSession.id, demoExciseMark(DEMO_COLA.barcode));
    exciseEngine.finalizeCart(exciseSession.id);
    payExcise(exciseSession.id, 'excise-only');
    const exciseRisk = exciseEngine.getPurchase(exciseSession.id).riskCheck;
    expect(exciseRisk?.reasons).not.toContain('Удалена дорогая позиция перед оплатой');
  });

  it('первое расхождение — 3 визита мониторинга; второе — принудительная сверка', () => {
    const { engine, pay } = engineWithRng(0.99);
    engine.useCatalog('full');

    const flagged = engine.startSession('store_udoma');
    engine.addItem(flagged.id, demoExciseMark(DEMO_ENERGY.barcode));
    engine.finalizeCart(flagged.id);
    pay(flagged.id, 'sanction-first-pay');
    engine.reportRiskMismatch(flagged.id);

    for (let i = 0; i < MONITORING_VISITS_AFTER_MISMATCH; i += 1) {
      const monitored = engine.startSession('store_udoma');
      engine.addItem(monitored.id, PEAS);
      engine.finalizeCart(monitored.id);
      const payment = pay(monitored.id, `sanction-monitor-${i}`);
      const risk = engine.getPurchase(monitored.id).riskCheck;
      expect(payment.customerNotice).toBe(false);
      expect(risk?.monitoringOnly).toBe(true);
      expect(risk?.attentionRequired).toBe(true);
    }

    const secondFlag = engine.startSession('store_udoma');
    engine.addItem(secondFlag.id, PEAS);
    engine.finalizeCart(secondFlag.id);
    pay(secondFlag.id, 'sanction-second-pay');
    engine.reportRiskMismatch(secondFlag.id);

    const forced = engine.startSession('store_udoma');
    engine.addItem(forced.id, PEAS);
    engine.finalizeCart(forced.id);
    const forcedPay = pay(forced.id, 'sanction-forced');
    expect(forcedPay.customerNotice).toBe(true);
    expect(engine.getPurchase(forced.id).riskCheck?.reasons).toContain(
      'Принудительная сверка по банковскому ID',
    );
  });
});