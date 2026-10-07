import { router } from 'expo-router';
import { Text } from 'react-native';

import { formatRub } from '@/domain/money';
import { usePurchases } from '@/queries/hooks';
import { Card, ListRow, Screen, StatusBadge, colors } from '@/ui';

export default function HistoryScreen() {
  const { data, isLoading } = usePurchases();

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Мои покупки</Text>
      {isLoading ? <Text style={{ color: colors.textMuted }}>Загружаем…</Text> : null}
      {!isLoading && (!data || data.length === 0) ? (
        <Text style={{ color: colors.textMuted }}>Пока нет завершённых покупок</Text>
      ) : null}
      {data?.map((item) => (
        <Card key={item.sessionId}>
          <ListRow
            title={item.storeName}
            subtitle={item.paidAt ? new Date(item.paidAt).toLocaleString('ru-RU') : undefined}
            right={<StatusBadge status={item.status} />}
            onPress={() => router.push(`/history/${item.sessionId}`)}
          />
          <Text style={{ fontWeight: '700', color: colors.text }}>{formatRub(item.total)}</Text>
        </Card>
      ))}
    </Screen>
  );
}
