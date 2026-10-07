import { MockEngine } from '@/api/mock/engine';
import { VtbGoError } from '@/domain/errors';
import type { SimulatorConfig } from '@/domain/types';

const COFFEE = '7613036930466';
const WATER = '3068320111007';
const UNKNOWN = '0000000000000';

function createEngine(sim: SimulatorConfig, now = 1_700_000_000_000) {
  let clock = now;
  const engine = MockEngine.create({
    now: () => clock,
    getSim: () => sim,
  });
  return {
    engine,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

describe('MockEngine', () => {
  it('повторный pay с тем же idempotency-key не создаёт второй платёж', () => {
    const { engine } = createEngine({ paymentMode: 'success', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    const first = engine.pay(session.id, {
      cartVersion: 2,
      method: 'card',
      idempotencyKey: 'idem-1',
    });
    const second = engine.pay(session.id, {
      cartVersion: 2,
      method: 'card',
      idempotencyKey: 'idem-1',
    });
    expect(second.id).toBe(first.id);
    expect(Object.keys(engine.state.payments)).toHaveLength(1);
    expect(first.status).toBe('succeeded');
  });

  it('оплата устаревшей версии корзины отклоняется', () => {
    const { engine } = createEngine({ paymentMode: 'success', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    const cart = engine.finalizeCart(session.id);
    engine.addItem(session.id, WATER, 'cashier');
    expect(() =>
      engine.pay(session.id, {
        cartVersion: cart.version,
        method: 'card',
        idempotencyKey: 'idem-stale',
      }),
    ).toThrow(VtbGoError);
    try {
      engine.pay(session.id, {
        cartVersion: cart.version,
        method: 'card',
        idempotencyKey: 'idem-stale',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(VtbGoError);
      expect((error as VtbGoError).code).toBe('CART_VERSION_STALE');
    }
    expect(Object.keys(engine.state.payments)).toHaveLength(0);
  });

  it('кассир увеличивает версию и возвращает сессию в shopping', () => {
    const { engine } = createEngine({ paymentMode: 'success', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    expect(engine.getSession(session.id).status).toBe('reviewing');
    engine.addItem(session.id, WATER, 'cashier');
    const updated = engine.getSession(session.id);
    expect(updated.status).toBe('shopping');
    expect(updated.cart.version).toBe(3);
    expect(updated.cart.items).toHaveLength(2);
  });

  it('неизвестный штрихкод даёт ITEM_NOT_FOUND', () => {
    const { engine } = createEngine({ paymentMode: 'success', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    try {
      engine.addItem(session.id, UNKNOWN);
      throw new Error('должно было упасть');
    } catch (error) {
      expect((error as VtbGoError).code).toBe('ITEM_NOT_FOUND');
    }
  });

  it('потерянный ответ: повтор с тем же ключом возвращает успешный платёж', () => {
    const { engine } = createEngine({ paymentMode: 'lost', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    try {
      engine.pay(session.id, {
        cartVersion: 2,
        method: 'sbp',
        idempotencyKey: 'idem-lost',
      });
      throw new Error('должно было потерять ответ');
    } catch (error) {
      expect((error as VtbGoError).code).toBe('NETWORK_LOST');
    }
    expect(engine.getSession(session.id).status).toBe('payment_unknown');
    expect(Object.keys(engine.state.payments)).toHaveLength(1);

    const recovered = engine.pay(session.id, {
      cartVersion: 2,
      method: 'sbp',
      idempotencyKey: 'idem-lost',
    });
    expect(recovered.status).toBe('succeeded');
    expect(engine.getSession(session.id).status).toBe('completed');
    expect(Object.keys(engine.state.payments)).toHaveLength(1);
  });

  it('отказ банка оставляет возможность оплатить заново', () => {
    let sim: SimulatorConfig = { paymentMode: 'decline', receiptMode: 'immediate' };
    const { engine } = createEngine(sim);
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    const declined = engine.pay(session.id, {
      cartVersion: 2,
      method: 'card',
      idempotencyKey: 'idem-fail',
    });
    expect(declined.status).toBe('declined');
    expect(engine.getSession(session.id).status).toBe('declined');
    sim.paymentMode = 'success';
    const second = engine.pay(session.id, {
      cartVersion: 2,
      method: 'digital_ruble',
      idempotencyKey: 'idem-ok',
    });
    expect(second.status).toBe('succeeded');
    expect(second.id).not.toBe(declined.id);
  });

  it('задержанный чек появляется после наступления срока', () => {
    const { engine, advance } = createEngine({ paymentMode: 'success', receiptMode: 'delayed' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    engine.pay(session.id, { cartVersion: 2, method: 'card', idempotencyKey: 'idem-rcpt' });
    expect(engine.getSession(session.id).status).toBe('paid_awaiting_receipt');
    advance(5000);
    const completed = engine.getSession(session.id);
    expect(completed.status).toBe('completed');
    const purchase = engine.getPurchase(session.id);
    expect(purchase.receipt?.fiscalMark).toBe('DEMO');
  });

  it('возврат проходит запрошен → подтверждён → проведён', () => {
    const { engine } = createEngine({ paymentMode: 'success', receiptMode: 'immediate' });
    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, COFFEE);
    engine.finalizeCart(session.id);
    engine.pay(session.id, { cartVersion: 2, method: 'card', idempotencyKey: 'idem-rf' });
    const itemId = engine.getSession(session.id).cart.items[0].id;
    const requested = engine.requestRefund(session.id, itemId);
    expect(requested.status).toBe('requested');
    expect(engine.getSession(session.id).status).toBe('refund_requested');
    expect(engine.approveRefund(session.id).status).toBe('approved');
    expect(engine.completeRefund(session.id).status).toBe('completed');
    expect(engine.getSession(session.id).status).toBe('refunded');
  });
});
