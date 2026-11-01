import { VtbGoError } from '@/domain/errors';
import type { CatalogItem } from '@/domain/types';

function flag(value: unknown): true | undefined {
  return value === true ? true : undefined;
}

export function parseCatalogItems(data: unknown): CatalogItem[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new VtbGoError('INVALID_CATALOG_ITEM', 'Каталог пуст или имеет неверный формат.');
  }

  return data.map((row, index) => {
    if (!row || typeof row !== 'object') {
      throw new VtbGoError('INVALID_CATALOG_ITEM', `Позиция ${index + 1} повреждена.`);
    }
    const item = row as Partial<CatalogItem>;
    if (typeof item.barcode !== 'string' || item.barcode.trim().length === 0) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', `У позиции ${index + 1} нет штрихкода.`);
    }
    if (typeof item.name !== 'string' || item.name.trim().length === 0) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', `У позиции ${index + 1} нет названия.`);
    }
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', `У «${item.name}» некорректная цена.`);
    }
    const weighted = flag(item.isWeighted);
    if (weighted && (typeof item.pluCode !== 'string' || !/^\d{5}$/.test(item.pluCode))) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', `У «${item.name}» нет PLU из 5 цифр.`);
    }
    return {
      barcode: item.barcode.trim(),
      name: item.name.trim(),
      price: Math.round(item.price * 100) / 100,
      requiresExcise: flag(item.requiresExcise),
      isAdultOnly: flag(item.isAdultOnly),
      isWeighted: weighted,
      pluCode: typeof item.pluCode === 'string' ? item.pluCode : undefined,
      cashbackRate: typeof item.cashbackRate === 'number' ? item.cashbackRate : undefined,
    };
  });
}
