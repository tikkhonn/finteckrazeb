import { StyleSheet, Text, View } from 'react-native';

import { SuccessCheckBadge } from '@/features/SuccessCheckBadge';
import { Amount, spacing, useTheme } from '@/ui';

type Props = {
  total: number;
  storeName: string;
  paidAt?: number;
};

export function PurchaseSuccessHeader({ total, storeName, paidAt }: Props) {
  const { colors, typography } = useTheme();
  const when = paidAt
    ? new Date(paidAt).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <SuccessCheckBadge />
      <Text style={typography.title}>Оплата прошла</Text>
      <Amount value={total} size="lg" />
      <Text style={[styles.store, { color: colors.text }]}>{storeName}</Text>
      {when ? <Text style={[styles.meta, { color: colors.textMuted }]}>{when}</Text> : null}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Электронный чек ниже. Покажите экран сотруднику, если магазин проводит выборочную проверку.
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
  store: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
