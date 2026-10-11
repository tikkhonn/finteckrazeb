import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CartItemRow } from '@/features/CartItemRow';
import { isVtbGoError } from '@/domain/errors';
import { useCancelSession, useFinalizeCart, useSession, useUpdateQty } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Amount, AnimatedEnter, Button, Card, Screen, spacing, useTheme } from '@/ui';

export default function CartScreen() {
  const { colors, typography } = useTheme();
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
      <Screen background="sky">
        <Text style={[styles.muted, { color: colors.textMuted }]}>Загружаем корзину…</Text>
      </Screen>
    );
  }

  const editable = session.status === 'shopping' || session.status === 'reviewing' || session.status === 'declined';

  return (
    <Screen
      background="sky"
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Сканировать товар"
            onPress={() => router.push(`/session/${id}/scan-item`)}
            disabled={!editable}
          />
          <Button
            title="К оплате"
            variant="secondary"
            onPress={() => void complete()}
            loading={finalize.isPending}
            disabled={session.cart.items.length === 0 || !editable}
          />
        </View>
      }
    >
      <AnimatedEnter index={0}>
        <Text style={typography.h2}>{session.storeName}</Text>
        <Text style={[styles.muted, { color: colors.textMuted }]}>Ваша корзина</Text>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <Card variant="elevated">
          {session.cart.items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Корзина пока пуста</Text>
              <Text style={[styles.mutedSmall, { color: colors.textMuted }]}>
                Нажмите «Сканировать товар» и наведите камеру на штрихкод — товар появится здесь.
              </Text>
            </View>
          ) : (
            session.cart.items.map((item, index) => (
              <CartItemRow
                key={item.id}
                item={item}
                index={index}
                editable={editable}
                onInc={() => updateQty.mutate({ itemId: item.id, qty: item.qty + 1 })}
                onDec={() => updateQty.mutate({ itemId: item.id, qty: item.qty - 1 })}
              />
            ))
          )}
        </Card>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <Card variant="elevated">
          <Text style={[styles.muted, { color: colors.textMuted }]}>Итого</Text>
          <Amount value={session.cart.total} />
          <Text style={[styles.mutedSmall, { color: colors.textMuted }]}>
            Окончательная сумма будет проверена перед оплатой
          </Text>
        </Card>
      </AnimatedEnter>

      {editable ? (
        <AnimatedEnter index={3}>
          <Pressable
            accessibilityRole="button"
            style={styles.cancel}
            onPress={() => {
              Alert.alert('Отменить покупку?', 'Корзина очистится, оплаты не будет.', [
                { text: 'Продолжить покупку', style: 'cancel' },
                {
                  text: 'Отменить',
                  style: 'destructive',
                  onPress: () => {
                    void cancel.mutateAsync().then(() => router.replace('/scan-and-go'));
                  },
                },
              ]);
            }}
          >
            <Text style={[styles.cancelText, { color: colors.danger }]}>Отменить покупку</Text>
          </Pressable>
        </AnimatedEnter>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { fontSize: 15, fontWeight: '400' },
  mutedSmall: { fontSize: 13, lineHeight: 18 },
  empty: { gap: spacing.xs, paddingVertical: spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '600' },
  cancel: { alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  cancelText: { fontSize: 14, fontWeight: '600' },
});
