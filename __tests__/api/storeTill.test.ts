import { MockEngine } from '@/api/mock/engine';
import catalog from '@/api/mock/catalog.json';
import { assertStoreTillExchange } from '@/domain/storeTillGuard';
import { PROFILES } from '@/domain/profile';

describe('store till exchange (152-ФЗ)', () => {
  it('после оплаты отдаёт sessionToken = id сессии, items и PAID без ПДн', () => {
    const engine = MockEngine.create({
      now: () => 1_700_000_000_000,
      getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
      getProfileId: () => 'anna',
    });
    const kitKat = catalog.find((item) => item.name === 'KitKat');
    expect(kitKat).toBeDefined();

    const session = engine.startSession('store_udoma');
    engine.addItem(session.id, kitKat!.barcode);
    engine.finalizeCart(session.id);
    const fresh = engine.getSession(session.id);

    const payment = engine.pay(session.id, {
      cartVersion: fresh.cart.version,
      method: 'card',
      idempotencyKey: 'store-till-test',
    });
    expect(payment.status).toBe('succeeded');

    const exchange = engine.releaseToStore(session.id);
    expect(exchange.sessionToken).toBe(session.id);
    expect(exchange.status).toBe('PAID');
    expect(exchange.items[0]).toMatchObject({
      sku: kitKat!.barcode,
      qty: 1,
      price: kitKat!.price,
    });

    const serialized = JSON.stringify(exchange);
    expect(serialized).not.toContain(PROFILES.anna.firstName);
    expect(serialized).not.toContain(PROFILES.anna.phone);
    expect(serialized).not.toContain(PROFILES.anna.cardPan);
    expect(serialized).not.toContain('profileId');
    assertStoreTillExchange(exchange);
  });
});