import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { PurchaseSuccessHeader } from '@/features/PurchaseSuccessHeader';
import { ReceiptPendingCard } from '@/features/ReceiptPendingCard';
import { usePay, useSession } from '@/queries/hooks';
import { AnimatedEnter, Button, Card, Screen, StatusBadge, spacing, useTheme } from '@/ui';

export default function PaymentStatusScreen() {
  const { colors } = useTheme();
  const { id, key } = useLocalSearchParams<{ id: string; key?: string }>();
  const sessionQuery = useSession(id, { poll: true });
  const pay = usePay(id);
  const session = sessionQuery.data;

  useEffect(() => {
    if (!session) {
      return;
    }
    if (session.status === 'completed' || session.status === 'paid_awaiting_receipt') {
      if (session.status === 'completed') {
        router.replace(`/session/${id}/done`);
      }
    }
  }, [session, id]);

  async function retry() {
    if (!session || !key) {
      return;
    }
    try {
      await pay.mutateAsync({
        cartVersion: session.cart.version,
        method: 'card',
        idempotencyKey: key,
      });
    } catch (err) {
      if (isVtbGoError(err) && err.code === 'NETWORK_LOST') {
        return;
      }
    }
  }

  if (!session) {
    return (
      <Screen background="sky">
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (session.status === 'declined') {
    return (
      <Screen background="sky">
        <AnimatedEnter index={0}>
          <StatusBadge status="declined" />
          <Text style={[styles.headline, { color: colors.text }]}>Банк отклонил оплату</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            Деньги не списаны. Можно выбрать другой способ и подтвердить ещё раз.
          </Text>
          <Button title="Вернуться к оплате" onPress={() => router.replace(`/session/${id}/checkout`)} />
        </AnimatedEnter>
      </Screen>
    );
  }

  if (session.status === 'paid_awaiting_receipt') {
    return (
      <Screen background="sky" edges={['bottom']}>
        <AnimatedEnter index={0}>
          <PurchaseSuccessHeader
            total={session.cart.total}
            storeName={session.storeName}
            paidAt={session.updatedAt}
          />
        </AnimatedEnter>
        <AnimatedEnter index={1}>
          <ReceiptPendingCard storeName={session.storeName} total={session.cart.total} />
        </AnimatedEnter>
      </Screen>
    );
  }

  if (session.status === 'completed') {
    return (
      <Screen background="sky">
        <Text style={[styles.muted, { color: colors.textMuted }]}>Переходим к чеку…</Text>
      </Screen>
    );
  }

  const unknown = session.status === 'payment_unknown';

  return (
    <Screen background="sky">
      <AnimatedEnter index={0}>
        <StatusBadge status={session.status} />
        <Text style={[styles.headline, { color: colors.text }]}>
          {unknown ? 'Проверяем статус оплаты' : 'Оплата обрабатывается'}
        </Text>
        <Card variant="elevated">
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            Это ещё не успешная покупка. Повторный запрос не создаёт новое списание — мы спрашиваем
            результат той же операции.
          </Text>
          <View style={styles.spinnerRow}>
            <ActivityIndicator color={colors.primary} />
            {unknown ? (
              <Button
                title="Повторить запрос"
                variant="secondary"
                loading={pay.isPending}
                onPress={() => void retry()}
              />
            ) : null}
          </View>
        </Card>
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 22, fontWeight: '700' },
  muted: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  amount: { fontSize: 20, fontWeight: '700' },
  spinnerRow: { gap: spacing.sm, marginTop: spacing.lg },
});
