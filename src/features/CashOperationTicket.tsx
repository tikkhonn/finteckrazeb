import { StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import type { CashOp } from '@/domain/profile';
import { radius, spacing, useTheme } from '@/ui';

type Props = {
  op: CashOp;
};

export function CashOperationTicket({ op }: Props) {
  const { colors, shadow } = useTheme();
  const topup = op.kind === 'topup';
  const when = new Date(op.at).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[styles.ticket, shadow.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="summary"
      accessibilityLabel={`${topup ? 'Пополнение' : 'Снятие'} ${formatRub(op.amount)}`}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>Операция по QR</Text>
          <Text style={[styles.title, { color: colors.text }]}>{topup ? 'Пополнение карты' : 'Снятие наличных'}</Text>
        </View>
        <View style={[styles.demoBadge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.demoBadgeText, { color: colors.warning }]}>Демо</Text>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Сумма</Text>
          <Text style={[styles.metaValue, { color: topup ? colors.success : colors.text }]}>
            {topup ? '+' : '−'}
            {formatRub(op.amount)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Дата</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{when}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Код точки</Text>
          <Text style={[styles.metaValue, { color: colors.textMuted }]} selectable numberOfLines={2}>
            {op.qr}
          </Text>
        </View>
      </View>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        Учебная операция в демо-приложении. Не является банковским документом.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    width: '100%',
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  demoBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
