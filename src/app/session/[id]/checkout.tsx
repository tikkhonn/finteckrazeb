import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { diffCarts, isCartChanged } from '@/domain/cart';
import { formatRub } from '@/domain/money';
import type { PaymentMethod } from '@/domain/types';
import { authenticatePayment } from '@/features/authenticatePayment';
import { CartDiffSheet } from '@/features/CartDiffSheet';
import { PaymentMethodPicker } from '@/features/PaymentMethodPicker';
import { useFinalizeCart, usePay, useSession } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Amount, AnimatedEnter, Button, Card, Screen, useTheme } from '@/ui';


export default function CheckoutScreen() {
  const { colors, typography } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionQuery = useSession(id, { poll: true });
  const pay = usePay(id);
  const finalize = useFinalizeCart(id);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const snapshot = useUiStore((s) => s.checkoutSnapshot);
  const setSnapshot = useUiStore((s) => s.setCheckoutSnapshot);
  const acknowledged = useUiStore((s) => s.acknowledgedVersion);
  const setAcknowledged = useUiStore((s) => s.setAcknowledgedVersion);
  const session = sessionQuery.data;

  useFocusEffect(
    useCallback(() => {
      if (session && !snapshot) {
        setSnapshot(session.cart);
        setAcknowledged(session.cart.version);
      }
    }, [session, snapshot, setSnapshot, setAcknowledged]),
  );

  if (!session) {
    return (
      <Screen background="sky">
        <Text style={[styles.muted, { color: colors.textMuted }]}>Готовим оплату…</Text>
      </Screen>
    );
  }

  const current = session;
  const diff = snapshot ? diffCarts(snapshot, current.cart) : null;
  const changed = Boolean(diff && isCartChanged(diff) && current.cart.version !== acknowledged);
  const canPay =
    !changed &&
    (current.status === 'reviewing' || current.status === 'declined') &&
    current.cart.items.length > 0;

  async function ackDiff() {
    setSnapshot(current.cart);
    setAcknowledged(current.cart.version);
    if (current.status === 'shopping') {
      await finalize.mutateAsync();
    }
  }

  async function submit() {
    const ok = await authenticatePayment();
    if (!ok) {
      return;
    }
    const idempotencyKey = `pay_${id}_${current.cart.version}_${Date.now()}`;
    try {
      await pay.mutateAsync({
        cartVersion: current.cart.version,
        method,
        idempotencyKey,
      });
      router.replace(`/session/${id}/payment-status?key=${idempotencyKey}`);
    } catch (err) {
      if (isVtbGoError(err) && err.code === 'NETWORK_LOST') {
        router.replace(`/session/${id}/payment-status?key=${idempotencyKey}`);
        return;
      }
      if (isVtbGoError(err) && err.code === 'CART_VERSION_STALE') {
        return;
      }
    }
  }

  return (
    <Screen
      background="sky"
      footer={
        <Button
          title={`Оплатить ${formatRub(session.cart.total)}`}
          disabled={!canPay}
          loading={pay.isPending}
          onPress={() => void submit()}
        />
      }
    >
      <AnimatedEnter index={0}>
        <Text style={typography.h2}>{session.storeName}</Text>
        <Text style={[styles.success, { color: colors.success }]}>Корзина проверена</Text>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <Card variant="elevated">
          <Text style={[styles.muted, { color: colors.textMuted }]}>К оплате</Text>
          <Amount value={session.cart.total} />
          <Text style={[styles.mutedSmall, { color: colors.textMuted }]}>
            Версия корзины №{session.cart.version} · оплачивается только эта сумма
          </Text>
        </Card>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <Card variant="elevated">
          {session.cart.items.map((item) => (
            <Text key={item.id} style={[styles.itemLine, { color: colors.text }]}>
              {item.name} × {item.qty}
            </Text>
          ))}
        </Card>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
        <Card variant="elevated">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Способ оплаты</Text>
          <PaymentMethodPicker value={method} onChange={setMethod} />
          <Text style={[styles.mutedSmall, { color: colors.textMuted }]}>
            Вы подтверждаете оплату этой корзины на сумму {formatRub(session.cart.total)}
          </Text>
        </Card>
      </AnimatedEnter>

      <CartDiffSheet visible={changed} diff={diff} onAck={() => void ackDiff()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { fontSize: 15, fontWeight: '400' },
  mutedSmall: { fontSize: 13, lineHeight: 18 },
  success: { fontWeight: '600', fontSize: 16 },
  itemLine: { fontSize: 15, fontWeight: '400' },
  sectionTitle: { fontWeight: '600', fontSize: 16 },
});
