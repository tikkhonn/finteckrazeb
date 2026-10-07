import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { diffCarts, isCartChanged } from '@/domain/cart';
import { formatRub } from '@/domain/money';
import type { PaymentMethod } from '@/domain/types';
import { authenticatePayment } from '@/features/authenticatePayment';
import { CartDiffSheet } from '@/features/CartDiffSheet';
import { PaymentMethodPicker } from '@/features/PaymentMethodPicker';
import { useFinalizeCart, usePay, useSession } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Amount, Button, Screen, colors } from '@/ui';


export default function CheckoutScreen() {
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
      <Screen>
        <Text style={{ color: colors.textMuted }}>Готовим оплату…</Text>
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
      footer={
        <Button
          title={`Оплатить ${formatRub(session.cart.total)}`}
          disabled={!canPay}
          loading={pay.isPending}
          onPress={() => void submit()}
        />
      }
    >
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{session.storeName}</Text>
      <Text style={{ color: colors.success, fontWeight: '600' }}>Корзина проверена</Text>
      <Text style={{ color: colors.textMuted }}>К оплате</Text>
      <Amount value={session.cart.total} />
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>
        Версия корзины №{session.cart.version} · оплачивается только эта сумма
      </Text>

      {session.cart.items.map((item) => (
        <Text key={item.id} style={{ color: colors.text }}>
          {item.name} × {item.qty}
        </Text>
      ))}

      <Text style={{ fontWeight: '600', color: colors.text }}>Способ оплаты</Text>
      <PaymentMethodPicker value={method} onChange={setMethod} />

      <Text style={{ color: colors.textMuted }}>
        Вы подтверждаете оплату этой корзины на сумму {formatRub(session.cart.total)}
      </Text>

      <CartDiffSheet visible={changed} diff={diff} onAck={() => void ackDiff()} />
    </Screen>
  );
}
