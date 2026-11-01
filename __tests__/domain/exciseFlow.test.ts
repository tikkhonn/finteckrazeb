import { MockEngine } from '@/api/mock/engine';
import { DEMO_WATER } from '@/api/mock/demoSkus';
import { VtbGoError } from '@/domain/errors';

function engine() {
  return MockEngine.create({
    now: () => 1_700_000_000_000,
    getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
  });
}

describe('акцизная марка', () => {
  it('скан напитка без марки переводит в ожидание, дубль и плюс требуют новую марку', () => {
    const shop = engine();
    shop.useCatalog('full');
    const session = shop.startSession('store_udoma');

    expect(() => shop.addItem(session.id, DEMO_WATER.barcode)).toThrow(VtbGoError);
    try {
      shop.addItem(session.id, DEMO_WATER.barcode);
    } catch (error) {
      expect((error as VtbGoError).code).toBe('AWAITING_EXCISE');
    }

    const first = shop.addItem(session.id, DEMO_WATER.barcode, 'customer', { exciseCode: 'MARK-1' });
    expect(first.items[0]).toMatchObject({ qty: 1, exciseCodes: ['MARK-1'] });

    expect(() => shop.addItem(session.id, DEMO_WATER.barcode, 'customer', { exciseCode: 'MARK-1' })).toThrow(VtbGoError);
    try {
      shop.addItem(session.id, DEMO_WATER.barcode, 'customer', { exciseCode: 'MARK-1' });
    } catch (error) {
      expect((error as VtbGoError).code).toBe('DUPLICATE_EXCISE_CODE');
    }

    expect(() => shop.updateQty(session.id, first.items[0].id, 2)).toThrow(VtbGoError);
    try {
      shop.updateQty(session.id, first.items[0].id, 2);
    } catch (error) {
      expect((error as VtbGoError).code).toBe('AWAITING_EXCISE');
    }

    const second = shop.addItem(session.id, DEMO_WATER.barcode, 'customer', { exciseCode: 'MARK-2' });
    expect(second.items).toHaveLength(1);
    expect(second.items[0].qty).toBe(2);
    expect(second.items[0].exciseCodes).toEqual(['MARK-1', 'MARK-2']);
  });
});
