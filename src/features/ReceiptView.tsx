import { StyleSheet, Text, View } from 'react-native';

import type { Receipt } from '@/domain/types';
import { formatRub } from '@/domain/money';
import { Card, StatusBadge, colors, spacing } from '@/ui';

interface ReceiptViewProps {
  receipt: Receipt;
}

export function ReceiptView({ receipt }: ReceiptViewProps) {
  return (
    <Card>
      <StatusBadge label="ДЕМО-чек" tone="warning" />
      <Text style={styles.title}>Электронный чек</Text>
      <Text style={styles.meta}>№ {receipt.number}</Text>
      <Text style={styles.meta}>
        {new Date(receipt.issuedAt).toLocaleString('ru-RU')}
      </Text>
      {receipt.items.map((item) => (
        <View key={item.id} style={styles.line}>
          <Text style={styles.name}>
            {item.name} × {item.qty}
          </Text>
          <Text style={styles.price}>{formatRub(item.unitPrice * item.qty)}</Text>
        </View>
      ))}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>{formatRub(receipt.total)}</Text>
      </View>
      <Text style={styles.disclaimer}>
        Это демонстрационный чек. Он не является фискальным документом.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  name: { flex: 1, color: colors.text },
  price: { fontWeight: '600', color: colors.text },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: { fontWeight: '600', color: colors.text },
  totalValue: { fontWeight: '700', fontSize: 16, color: colors.text },
  disclaimer: { fontSize: 12, color: colors.warning },
});
