import { MockEngine } from '@/api/mock/engine';
import { APPLE_SCALE_CODE } from '@/api/mock/demoSkus';
import { parseScannedCode } from '@/domain/scanner/barcodeParser';

describe('весовой EAN-13', () => {
  it('читает PLU и вес из этикетки 2100105004509 и считает 81 ₽', () => {
    expect(parseScannedCode(APPLE_SCALE_CODE)).toEqual({
      type: 'weighted',
      ean13: APPLE_SCALE_CODE,
      pluCode: '00105',
      weightKg: 0.45,
    });

    const engine = MockEngine.create({
      now: () => 1_700_000_000_000,
      getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
    });
    engine.useCatalog('full');
    const session = engine.startSession('store_udoma');
    const cart = engine.addItem(session.id, APPLE_SCALE_CODE);
    expect(cart.items[0]).toMatchObject({
      name: 'Яблоки Гала',
      unitPrice: 180,
      weightKg: 0.45,
      qty: 1,
    });
    expect(cart.total).toBe(81);
  });
});
