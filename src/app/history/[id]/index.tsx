import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { ReceiptView } from '@/features/ReceiptView';
import { formatRub } from '@/domain/money';
import { usePurchase } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Button, Card, Screen, StatusBadge, colors } from '@/ui';

export default function PurchaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = usePurchase(id);
  const setActiveSession = useUiStore((s) => s.setActiveSession);

  useEffect(() => {
    if (id) {
      setActiveSession(id);
    }
  }, [id, setActiveSession]);

  if (!data) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Загружаем покупку…</Text>
      </Screen>
    );
  }

  const canRefund = data.session.status === 'completed' || data.session.status === 'refunded';

  return (
    <Screen>
      <StatusBadge status={data.session.status} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{data.session.storeName}</Text>
      <Text style={{ color: colors.textMuted }}>{formatRub(data.session.cart.total)}</Text>

      <Card>
        {data.session.cart.items.map((item) => (
          <Text key={item.id} style={{ color: colors.text }}>
            {item.name} × {item.qty} — {formatRub(item.unitPrice * item.qty)}
          </Text>
        ))}
      </Card>

      {data.receipt ? <ReceiptView receipt={data.receipt} /> : <Text>Чек ещё не сформирован</Text>}

      {data.refunds.map((refund) => (
        <Card key={refund.id}>
          <Text style={{ fontWeight: '600' }}>Возврат: {refund.itemName}</Text>
          <Text style={{ color: colors.textMuted }}>
            {formatRub(refund.amount)} · {refund.status}
          </Text>
        </Card>
      ))}

      {canRefund ? (
        <Button title="Оформить возврат" onPress={() => router.push(`/history/${id}/refund`)} />
      ) : null}
      <Button title="Проблема с покупкой" variant="ghost" onPress={() => router.push('/help')} />
    </Screen>
  );
}
