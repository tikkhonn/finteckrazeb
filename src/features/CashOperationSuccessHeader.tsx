import { StyleSheet, Text, View } from 'react-native';

import type { CashKind } from '@/domain/profile';
import { formatRub } from '@/domain/money';
import { SuccessCheckBadge } from '@/features/SuccessCheckBadge';
import { spacing, useTheme } from '@/ui';

type Props = {
  kind: CashKind;
  amount: number;
  at: number;
};

export function CashOperationSuccessHeader({ kind, amount, at }: Props) {
  const { colors, typography } = useTheme();
  const topup = kind === 'topup';
  const when = new Date(at).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <SuccessCheckBadge />
      <Text style={typography.title}>{topup ? 'Пополнение выполнено' : 'Снятие выполнено'}</Text>
      <Text
        style={[styles.amount, { color: topup ? colors.success : colors.text }]}
        accessibilityLabel={`${topup ? 'Плюс' : 'Минус'} ${formatRub(amount)}`}
      >
        {topup ? '+' : '−'}
        {formatRub(amount)}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>{when}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {topup
          ? 'Средства зачислены на карту. Баланс уже обновлён.'
          : 'Операция подтверждена. Получите наличные у сотрудника партнёрской точки.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  meta: {
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
