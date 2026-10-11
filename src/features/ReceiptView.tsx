import { StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import type { Receipt } from '@/domain/types';
import { radius, spacing, useTheme } from '@/ui';

interface ReceiptViewProps {
  receipt: Receipt;
  storeName?: string;
}

function formatReceiptDate(ts: number): string {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReceiptView({ receipt, storeName }: ReceiptViewProps) {
  const { colors, shadow } = useTheme();

  return (
    <View
      style={[styles.ticket, shadow.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="summary"
      accessibilityLabel={`Электронный чек номер ${receipt.number}`}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>Электронный чек</Text>
          {storeName ? (
            <Text style={[styles.store, { color: colors.text }]} numberOfLines={2}>
              {storeName}
            </Text>
          ) : null}
        </View>
        <View style={[styles.demoBadge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.demoBadgeText, { color: colors.warning }]}>Демо</Text>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>№ чека</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{receipt.number}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Дата</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatReceiptDate(receipt.issuedAt)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Фиск. признак</Text>
          <Text style={[styles.metaValue, { color: colors.textMuted }]}>{receipt.fiscalMark}</Text>
        </View>
      </View>

      <View style={[styles.divider, { borderTopColor: colors.border }]} />

      <View style={styles.lines}>
        {receipt.items.map((item) => (
          <View key={item.id} style={styles.line}>
            <View style={styles.lineText}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.itemQty, { color: colors.textMuted }]}>
                {formatRub(item.unitPrice)} × {item.qty}
              </Text>
            </View>
            <Text style={[styles.itemSum, { color: colors.text }]}>
              {formatRub(item.unitPrice * item.qty)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.totalRow, { borderTopColor: colors.border, backgroundColor: colors.chip }]}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Итого</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>{formatRub(receipt.total)}</Text>
      </View>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        Демонстрационный чек для учебного сценария. Не является фискальным документом.
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
  store: {
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
    alignItems: 'baseline',
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
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginHorizontal: spacing.lg,
  },
  lines: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lineText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemQty: {
    fontSize: 12,
  },
  itemSum: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
