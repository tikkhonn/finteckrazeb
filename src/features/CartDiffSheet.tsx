import { Text, View } from 'react-native';

import type { CartDiff } from '@/domain/cart';
import { formatRub } from '@/domain/money';
import { BottomSheet, Button, colors, spacing } from '@/ui';

interface CartDiffSheetProps {
  visible: boolean;
  diff: CartDiff | null;
  onAck: () => void;
}

export function CartDiffSheet({ visible, diff, onAck }: CartDiffSheetProps) {
  if (!diff) {
    return null;
  }
  return (
    <BottomSheet visible={visible} title="Магазин изменил корзину">
      <Text style={{ color: colors.textMuted }}>
        Было {formatRub(diff.oldTotal)} → стало {formatRub(diff.newTotal)}
      </Text>
      {diff.added.map((item) => (
        <Text key={item.id} style={{ color: colors.text }}>
          Добавлено: {item.name} {formatRub(item.unitPrice * item.qty)}
        </Text>
      ))}
      {diff.removed.map((item) => (
        <Text key={item.id} style={{ color: colors.text }}>
          Удалено: {item.name}
        </Text>
      ))}
      {diff.qtyChanged.map((item) => (
        <Text key={item.barcode} style={{ color: colors.text }}>
          {item.name}: {item.oldQty} → {item.newQty} шт.
        </Text>
      ))}
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>
        Версия корзины {diff.oldVersion} → {diff.newVersion}. Нужно новое согласие на оплату.
      </Text>
      <View style={{ gap: spacing.sm }}>
        <Button title="Понятно" onPress={onAck} />
      </View>
    </BottomSheet>
  );
}
