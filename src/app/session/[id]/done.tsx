import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { ReceiptView } from '@/features/ReceiptView';
import { formatRub } from '@/domain/money';
import { usePurchase } from '@/queries/hooks';
import { Amount, Button, Screen, StatusBadge, colors } from '@/ui';

export default function DoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const purchaseQuery = usePurchase(id);
  const purchase = purchaseQuery.data;

  if (!purchase) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Загружаем покупку…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBadge status={purchase.session.status} />
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Покупка оплачена</Text>
      <Amount value={purchase.session.cart.total} size="md" />
      <Text style={{ color: colors.textMuted }}>
        {formatRub(purchase.session.cart.total)} · {purchase.session.storeName}
      </Text>
      <Text style={{ color: colors.textMuted }}>
        Покажите экран сотруднику, если магазин проводит выборочную проверку.
      </Text>

      {purchase.receipt ? (
        <ReceiptView receipt={purchase.receipt} />
      ) : (
        <Text style={{ color: colors.warning }}>Чек ещё формируется</Text>
      )}

      <Button title="Открыть историю" variant="secondary" onPress={() => router.replace(`/history/${id}`)} />
      <Button title="Проблема с покупкой" variant="ghost" onPress={() => router.push('/help')} />
      <Button title="На главную" variant="ghost" onPress={() => router.replace('/')} />
    </Screen>
  );
}
