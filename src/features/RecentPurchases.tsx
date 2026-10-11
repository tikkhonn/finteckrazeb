import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import { usePurchases } from '@/queries/hooks';
import { Button, Card, ListRow, StatusBadge, spacing, useTheme } from '@/ui';

const PREVIEW_LIMIT = 2;

export function RecentPurchases() {
  const { colors } = useTheme();
  const { data, isLoading } = usePurchases();
  const recent = data?.slice(0, PREVIEW_LIMIT) ?? [];

  return (
    <Card variant="elevated">
      <Text style={[styles.lead, { color: colors.text }]}>Чеки и возвраты</Text>

      {isLoading ? <Text style={[styles.caption, { color: colors.textMuted }]}>Загружаем…</Text> : null}
      {!isLoading && recent.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Чеки появятся после оплаты Scan & Go</Text>
      ) : null}

      {recent.map((item) => (
        <View key={item.sessionId} style={[styles.row, { borderBottomColor: colors.border }]}>
          <ListRow
            title={item.storeName}
            subtitle={`${formatRub(item.total)}${
              item.paidAt ? ` · ${new Date(item.paidAt).toLocaleDateString('ru-RU')}` : ''
            }`}
            right={<StatusBadge status={item.status} />}
            onPress={() => router.push(`/history/${item.sessionId}`)}
          />
        </View>
      ))}

      <Button title="Все чеки и возвраты" variant="secondary" onPress={() => router.push('/history')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 13 },
  empty: { fontSize: 14, paddingVertical: spacing.sm },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
