import { MockEngine } from '@/api/mock/engine';
import { parseScannedCode } from '@/domain/scanner/barcodeParser';

const GS1 = '010460708656021321ABC123XYZ';

describe('GS1 DataMatrix', () => {
  it('извлекает EAN-13 и оставляет сырую марку', () => {
    expect(parseScannedCode(GS1)).toEqual({
      type: 'gs1',
      ean13: '4607086560213',
      exciseCode: GS1,
    });
  });

  it('одним сканом кладёт колу и марку в корзину полной базы', () => {
    const engine = MockEngine.create({
      now: () => 1_700_000_000_000,
      getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
    });
    engine.useCatalog('full');
    expect(engine.getCatalog()).toHaveLength(50);
    const session = engine.startSession('store_udoma');
    const cart = engine.addItem(session.id, GS1);
    expect(cart.items[0]).toMatchObject({
      name: 'Coca-Cola 0,5 л',
      qty: 1,
      exciseCodes: [GS1],
    });
  });
});
