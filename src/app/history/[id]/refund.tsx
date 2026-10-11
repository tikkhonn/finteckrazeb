import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { formatRub } from '@/domain/money';
import { usePurchase, useRequestRefund } from '@/queries/hooks';
import { Button, Card, Screen, useTheme } from '@/ui';

export default function RefundScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = usePurchase(id);
  const request = useRequestRefund(id);
  const [itemId, setItemId] = useState<string | null>(null);

  async function submit() {
    if (!itemId) {
      return;
    }
    try {
      await request.mutateAsync(itemId);
      Alert.alert(
        'Запрос отправлен',
        'Это не возврат денег. Магазин проверит товар и примет решение.',
        [{ text: 'Понятно', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('Не удалось', isVtbGoError(err) ? err.message : 'Попробуйте позже');
    }
  }

  if (!data) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Загружаем…</Text>
      </Screen>
    );
  }

  return (
    <Screen
      footer={<Button title="Оформить возврат" disabled={!itemId} loading={request.isPending} onPress={() => void submit()} />}
    >
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Оформить возврат</Text>
      <Text style={{ color: colors.textMuted }}>
        Выберите одну позицию. Нажатие не означает, что деньги вернутся сразу.
      </Text>
      {data.session.cart.items.map((item) => (
        <Card key={item.id}>
          <Text style={{ fontWeight: '600', color: colors.text }}>{item.name}</Text>
          <Text style={{ color: colors.textMuted }}>{formatRub(item.unitPrice * item.qty)}</Text>
          <Button
            title={itemId === item.id ? 'Выбрано' : 'Выбрать'}
            variant={itemId === item.id ? 'primary' : 'secondary'}
            onPress={() => setItemId(item.id)}
          />
        </Card>
      ))}
    </Screen>
  );
}
