import { MockEngine } from '@/api/mock/engine';
import { DEMO_ENERGY } from '@/api/mock/demoSkus';
import { VtbGoError } from '@/domain/errors';
import { demoExciseMark } from '@/domain/scanner/barcodeParser';

function engine(adult: boolean) {
  return MockEngine.create({
    now: () => 1_700_000_000_000,
    getSim: () => ({ paymentMode: 'success', receiptMode: 'immediate' }),
    isAdultVerified: () => adult,
  });
}

describe('проверка 18+', () => {
  it('отказывает Дмитрию и пропускает Анну', () => {
    const minor = engine(false);
    minor.useCatalog('full');
    const blocked = minor.startSession('store_udoma');
    expect(() => minor.addItem(blocked.id, DEMO_ENERGY.barcode)).toThrow(VtbGoError);
    try {
      minor.addItem(blocked.id, DEMO_ENERGY.barcode);
    } catch (error) {
      expect((error as VtbGoError).code).toBe('AGE_RESTRICTED_18_PLUS');
    }
    expect(minor.getSession(blocked.id).cart.items).toHaveLength(0);

    const adult = engine(true);
    adult.useCatalog('full');
    const allowed = adult.startSession('store_udoma');
    const cart = adult.addItem(allowed.id, demoExciseMark(DEMO_ENERGY.barcode, 1_700_000_000_000));
    expect(cart.items[0]).toMatchObject({ name: 'Adrenaline Rush 0,449 л', isAdultOnly: true, qty: 1 });
  });
});
