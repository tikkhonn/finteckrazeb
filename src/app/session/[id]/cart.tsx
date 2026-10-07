import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { CartItemRow } from '@/features/CartItemRow';
import { isVtbGoError } from '@/domain/errors';
import { useCancelSession, useFinalizeCart, useSession, useUpdateQty } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Amount, Button, Screen, colors } from '@/ui';

export default function CartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionQuery = useSession(id, { poll: true });
  const updateQty = useUpdateQty(id);
  const finalize = useFinalizeCart(id);
  const cancel = useCancelSession(id);
  const setSnapshot = useUiStore((s) => s.setCheckoutSnapshot);
  const setAcknowledged = useUiStore((s) => s.setAcknowledgedVersion);
  const session = sessionQuery.data;

  async function complete() {
    try {
      setSnapshot(null);
      setAcknowledged(null);
      await finalize.mutateAsync();
      router.push(`/session/${id}/checkout`);
    } catch (err) {
      Alert.alert('Нельзя завершить', isVtbGoError(err) ? err.message : 'Попробуйте ещё раз');
    }
  }

  if (!session) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Загружаем корзину…</Text>
      </Screen>
    );
  }

  const editable = session.status === 'shopping' || session.status === 'reviewing' || session.status === 'declined';

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          <Button
            title="Сканировать товар"
            onPress={() => router.push(`/session/${id}/scan-item`)}
            disabled={!editable}
          />
          <Button
            title="Завершить покупку"
            variant="secondary"
            onPress={() => void complete()}
            loading={finalize.isPending}
            disabled={session.cart.items.length === 0 || !editable}
          />
        </View>
      }
    >
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{session.storeName}</Text>
      <Text style={{ color: colors.textMuted }}>Ваша корзина</Text>

      {session.cart.items.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>Отсканируйте первый товар</Text>
      ) : (
        session.cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            editable={editable}
            onInc={() => updateQty.mutate({ itemId: item.id, qty: item.qty + 1 })}
            onDec={() => updateQty.mutate({ itemId: item.id, qty: item.qty - 1 })}
          />
        ))
      )}

      <View>
        <Text style={{ color: colors.textMuted }}>Итого</Text>
        <Amount value={session.cart.total} />
        <Text style={{ color: colors.textMuted }}>
          Окончательная сумма будет проверена перед оплатой
        </Text>
      </View>

      <Button
        title="Передумал"
        variant="ghost"
        onPress={() => {
          Alert.alert('Отменить покупку?', 'Сессия будет закрыта', [
            { text: 'Нет', style: 'cancel' },
            {
              text: 'Отменить',
              style: 'destructive',
              onPress: () => {
                void cancel.mutateAsync().then(() => router.replace('/'));
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}
