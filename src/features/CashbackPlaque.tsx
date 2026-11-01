import { StyleSheet, Text, View } from 'react-native';

import { basketCashback } from '@/domain/cart';
import { formatRub } from '@/domain/money';
import type { CartItem, PaymentMethod } from '@/domain/types';
import { radius, spacing, useTheme } from '@/ui';

interface CashbackPlaqueProps {
  items: CartItem[];
  method: PaymentMethod;
}

export function CashbackPlaque({ items, method }: CashbackPlaqueProps) {
  const { colors } = useTheme();
  const amount = basketCashback(items, method);
  const cardAmount = basketCashback(items, 'card');
  const palette =
    method === 'card'
      ? { bg: colors.successBg, fg: colors.success }
      : method === 'digital_ruble'
        ? { bg: colors.infoBg, fg: colors.info }
        : { bg: colors.chip, fg: colors.textMuted };
  const text =
    method === 'card'
      ? `+${formatRub(amount)} кешбэка начислим за эту покупку`
      : method === 'digital_ruble'
        ? `+${formatRub(amount)} бонусами за тест Цифрового рубля (50% кешбэка)`
        : `0 ₽ кешбэка при оплате по СБП. Выберите Карту ВТБ, чтобы получить +${formatRub(cardAmount)}`;

  return (
    <View style={[styles.box, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
