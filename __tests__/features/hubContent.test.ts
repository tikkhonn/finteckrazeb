import { findCertificate, findFaq, findWallet } from '@/features/hubContent';

describe('hubContent', () => {
  it('находит карту, справку и тему поддержки', () => {
    expect(findWallet('sber')?.bank).toBe('Сбербанк');
    expect(findCertificate('balance')?.title).toMatch(/остатке/i);
    expect(findFaq('scan')?.title).toBe('Scan & Go');
  });

  it('возвращает undefined для неизвестного id', () => {
    expect(findWallet('none')).toBeUndefined();
    expect(findCertificate('none')).toBeUndefined();
    expect(findFaq('none')).toBeUndefined();
  });
});
