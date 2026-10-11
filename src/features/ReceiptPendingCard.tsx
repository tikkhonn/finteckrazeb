import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import { radius, spacing, useTheme } from '@/ui';

type Props = {
  storeName: string;
  total: number;
};

export function ReceiptPendingCard({ storeName, total }: Props) {
  const { colors, shadow } = useTheme();

  return (
    <View
      style={[styles.ticket, shadow.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="text"
      accessibilityLabel="Чек формируется"
    >
      <View style={[styles.banner, { backgroundColor: colors.warningBg }]}>
        <Text style={[styles.bannerText, { color: colors.warning }]}>Оформляем чек</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>{storeName}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>{formatRub(total)}</Text>
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.lead, { color: colors.textMuted }]}>
            Касса магазина формирует электронный чек. Обычно это занимает несколько секунд.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  lead: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
