import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import type { CashOp } from '@/domain/profile';
import type { PurchaseSummary } from '@/domain/types';
import { usePurchases } from '@/queries/hooks';
import { useProfileStore } from '@/store/profileStore';
import { spacing, useTheme, type ThemeColors } from '@/ui';

type Row = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  credit: boolean;
  mark: string;
  markBg: string;
  at: number;
  onPress: () => void;
};

function cashRow(op: CashOp, palette: ThemeColors): Row {
  const credit = op.kind === 'topup';
  return {
    id: op.id,
    title: credit ? 'Пополнение по QR' : 'Снятие по QR',
    subtitle: credit ? 'Пополнение' : 'Снятие',
    amount: op.amount,
    credit,
    mark: credit ? '+' : '↓',
    markBg: credit ? palette.accent : palette.warning,
    at: op.at,
    onPress: () => router.push(`/account/op/${op.id}`),
  };
}

function purchaseRow(item: PurchaseSummary, palette: ThemeColors): Row {
  return {
    id: item.sessionId,
    title: item.storeName,
    subtitle: 'Покупка в магазине',
    amount: item.total,
    credit: false,
    mark: '✓',
    markBg: palette.success,
    at: item.paidAt ?? 0,
    onPress: () => router.push(`/history/${item.sessionId}`),
  };
}

export function AccountOperations() {
  const { colors } = useTheme();
  const { data, isLoading } = usePurchases();
  const cashOpsById = useProfileStore((s) => s.cashOpsById);
  const activeId = useProfileStore((s) => s.activeId);
  const cash = cashOpsById[activeId] ?? [];

  const rows = [
    ...(data ?? []).map((item) => purchaseRow(item, colors)),
    ...cash.map((op) => cashRow(op, colors)),
  ].sort((a, b) => b.at - a.at);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.text }]}>Последние операции</Text>
      {isLoading ? <Text style={[styles.empty, { color: colors.textMuted }]}>Загружаем…</Text> : null}
      {!isLoading && rows.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Пока нет покупок и операций по QR</Text>
      ) : null}
      {rows.map((row) => (
        <Pressable
          key={row.id}
          accessibilityRole="button"
          accessibilityLabel={row.title}
          onPress={row.onPress}
          style={({ pressed }) => [styles.row, { borderBottomColor: colors.border }, pressed && styles.pressed]}
        >
          <View style={[styles.mark, { backgroundColor: row.markBg }]}>
            <Text style={[styles.markText, { color: colors.onPrimary }]}>{row.mark}</Text>
          </View>
          <View style={styles.text}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {row.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{row.subtitle}</Text>
          </View>
          <Text style={[styles.amount, { color: row.credit ? colors.success : colors.text }]}>
            {row.credit ? '+' : '−'}
            {formatRub(row.amount)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 2 },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  empty: { fontSize: 13, paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: { opacity: 0.7 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 16, fontWeight: '700' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  amount: { fontSize: 15, fontWeight: '700' },
});
