import { assertEan13, normalizeEan13 } from '@/domain/ean';
import { VtbGoError } from '@/domain/errors';

describe('normalizeEan13', () => {
  it('принимает валидный EAN-13', () => {
    expect(normalizeEan13('4600494600173')).toBe('4600494600173');
  });

  it('убирает пробелы и прочие символы', () => {
    expect(normalizeEan13(' 4600 4946-00173 ')).toBe('4600494600173');
  });

  it('дополняет UPC-A ведущим нулём', () => {
    expect(normalizeEan13('036000291452')).toBe('0036000291452');
  });

  it('отклоняет неверную контрольную цифру', () => {
    expect(normalizeEan13('4600494600174')).toBeNull();
  });

  it('отклоняет неверную длину и пустую строку', () => {
    expect(normalizeEan13('12345678')).toBeNull();
    expect(normalizeEan13('')).toBeNull();
  });
});

describe('assertEan13', () => {
  it('бросает INVALID_BARCODE на мусоре', () => {
    expect(() => assertEan13('abc')).toThrow(VtbGoError);
    try {
      assertEan13('abc');
    } catch (error) {
      expect((error as VtbGoError).code).toBe('INVALID_BARCODE');
    }
  });
});
