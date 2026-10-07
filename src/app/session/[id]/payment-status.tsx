import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { formatRub } from '@/domain/money';
import { usePay, useSession } from '@/queries/hooks';
import { Button, Screen, StatusBadge, colors, spacing } from '@/ui';

export default function PaymentStatusScreen() {
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
      <Screen>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (session.status === 'declined') {
    return (
      <Screen>
        <StatusBadge status="declined" />
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Банк отклонил оплату</Text>
        <Text style={{ color: colors.textMuted }}>
          Деньги не списаны. Можно выбрать другой способ и подтвердить ещё раз.
        </Text>
        <Button title="Вернуться к оплате" onPress={() => router.replace(`/session/${id}/checkout`)} />
      </Screen>
    );
  }

  if (session.status === 'paid_awaiting_receipt') {
    return (
      <Screen>
        <StatusBadge status="paid_awaiting_receipt" />
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Оплата прошла</Text>
        <Text style={{ color: colors.textMuted }}>
          Завершаем оформление покупки. Чек появится, когда касса магазина его сформирует.
        </Text>
        <Text style={{ color: colors.text }}>{formatRub(session.cart.total)}</Text>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (session.status === 'completed') {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Переходим к чеку…</Text>
      </Screen>
    );
  }

  const unknown = session.status === 'payment_unknown';

  return (
    <Screen>
      <StatusBadge status={session.status} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
        {unknown ? 'Проверяем статус оплаты' : 'Оплата обрабатывается'}
      </Text>
      <Text style={{ color: colors.textMuted }}>
        Это ещё не успешная покупка. Повторный запрос не создаёт новое списание — мы спрашиваем
        результат той же операции.
      </Text>
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
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
    </Screen>
  );
}
