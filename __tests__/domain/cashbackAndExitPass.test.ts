import { MockEngine } from '@/api/mock/engine';
import { basketCashback } from '@/domain/cart';
import { exitPassToken } from '@/domain/exitPass';
import type { CartItem, PaymentMethod } from '@/domain/types';

const COFFEE = '7613036930468';

const LINE: CartItem = {
  id: 'item_1',
  barcode: '4600000000000',
  name: 'Тест',
  unitPrice: 1000,
  qty: 1,
  addedBy: 'customer',
  exciseCodes: [],
  calculatedCashback: 50,
  cashbackRate: 0.05,
};

function paidCashback(method: PaymentMethod): number | undefined {
  const engine = MockEngine.create({
    now: () => 1_700_000_000_000,
    getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
  });
  const session = engine.startSession('store_udoma');
  engine.addItem(session.id, COFFEE);
  engine.finalizeCart(session.id);
  engine.pay(session.id, { cartVersion: 2, method, idempotencyKey: `idem-${method}` });
  return engine.getPurchase(session.id).receipt?.cashbackEarned;
}

describe('кешбэк и пропуск на выход', () => {
  it('обнуляет кешбэк на СБП и оставляет его на карте', () => {
    expect(basketCashback([LINE], 'card')).toBe(50);
    expect(basketCashback([LINE], 'digital_ruble')).toBe(25);
    expect(basketCashback([LINE], 'sbp')).toBe(0);
    expect(paidCashback('sbp')).toBe(0);
    expect(paidCashback('card')).toBe(10);
  });

  it('меняет токен пропуска каждые 30 секунд', () => {
    expect(exitPassToken('rcpt_1', 0)).toBe('VTBGO-EXIT-rcpt_1-0');
    expect(exitPassToken('rcpt_1', 29_999)).toBe(exitPassToken('rcpt_1', 0));
    expect(exitPassToken('rcpt_1', 30_000)).toBe('VTBGO-EXIT-rcpt_1-1');
    expect(exitPassToken('rcpt_1', 30_000)).not.toBe(exitPassToken('rcpt_1', 0));
  });
});
