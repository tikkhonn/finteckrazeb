import { VtbGoError } from './errors';

const EAN13_LENGTH = 13;
const UPC_A_LENGTH = 12;

function checkDigit(body: string): number {
  const sum = [...body].reduce(
    (acc, digit, index) => acc + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (sum % 10)) % 10;
}

/** Returns a canonical EAN-13 or `null` when the code is not a valid GTIN-13 / UPC-A. */
export function normalizeEan13(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  const code = digits.length === UPC_A_LENGTH ? `0${digits}` : digits;
  if (code.length !== EAN13_LENGTH) {
    return null;
  }
  const body = code.slice(0, -1);
  return checkDigit(body) === Number(code.at(-1)) ? code : null;
}

export function assertEan13(raw: string): string {
  const code = normalizeEan13(raw);
  if (!code) {
    throw new VtbGoError('INVALID_BARCODE', 'Некорректный штрихкод. Нужен EAN-13.');
  }
  return code;
}
