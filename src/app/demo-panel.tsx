import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { getMockApi, isMockApi } from '@/api/apiProvider';
import type { PaymentSimMode, ReceiptSimMode } from '@/domain/types';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useDemoStore } from '@/store/demoStore';
import { useUiStore } from '@/store/uiStore';
import { Button, Card, Screen, colors, spacing } from '@/ui';

async function refreshSession(sessionId: string) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
  await queryClient.invalidateQueries({ queryKey: queryKeys.purchase(sessionId) });
  await queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
}

const PAYMENT_MODES: { id: PaymentSimMode; title: string }[] = [
  { id: 'success', title: 'Успех' },
  { id: 'decline', title: 'Отказ банка' },
  { id: 'delay', title: 'Задержка 5 с' },
  { id: 'lost', title: 'Потерять ответ' },
];

const RECEIPT_MODES: { id: ReceiptSimMode; title: string }[] = [
  { id: 'immediate', title: 'Чек сразу' },
  { id: 'delayed', title: 'Чек с задержкой' },
];

export default function DemoPanelScreen() {
  const mock = getMockApi();
  const sessionId = useUiStore((s) => s.activeSessionId);
  const paymentMode = useDemoStore((s) => s.paymentMode);
  const receiptMode = useDemoStore((s) => s.receiptMode);
  const setPaymentMode = useDemoStore((s) => s.setPaymentMode);
  const setReceiptMode = useDemoStore((s) => s.setReceiptMode);

  if (!isMockApi || !mock) {
    return (
      <Screen>
        <Text>Демо-панель доступна только с mock-адаптером.</Text>
      </Screen>
    );
  }

  const catalog = mock.getCatalog();
  const events = mock.listEvents(sessionId ?? undefined).slice(-12).reverse();

  function requireSession(): string | null {
    if (!sessionId) {
      Alert.alert('Нет активной сессии', 'Сначала начните покупку.');
      return null;
    }
    return sessionId;
  }

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Демо-панель</Text>
      <Text style={{ color: colors.textMuted }}>
        Сессия: {sessionId ?? 'нет'} · долгое нажатие на «ВТБ Go» открывает эту панель
      </Text>

      <Card>
        <Text style={{ fontWeight: '700' }}>Режим платежа</Text>
        {PAYMENT_MODES.map((mode) => (
          <Button
            key={mode.id}
            title={mode.title}
            variant={paymentMode === mode.id ? 'primary' : 'secondary'}
            onPress={() => setPaymentMode(mode.id)}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Режим чека</Text>
        {RECEIPT_MODES.map((mode) => (
          <Button
            key={mode.id}
            title={mode.title}
            variant={receiptMode === mode.id ? 'primary' : 'secondary'}
            onPress={() => setReceiptMode(mode.id)}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Кассир добавил товар</Text>
        {catalog.map((item) => (
          <Button
            key={`c-${item.barcode}`}
            title={item.name}
            variant="secondary"
            onPress={() => {
              const id = requireSession();
              if (!id) return;
              void mock
                .cashierAddItem(id, item.barcode)
                .then(() => refreshSession(id))
                .catch((err) => Alert.alert('Ошибка', String(err.message)));
            }}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Добавить в корзину (без камеры)</Text>
        {catalog.map((item) => (
          <Button
            key={`a-${item.barcode}`}
            title={item.name}
            variant="ghost"
            onPress={() => {
              const id = requireSession();
              if (!id) return;
              void mock
                .addItem(id, item.barcode)
                .then(() => refreshSession(id))
                .catch((err) => Alert.alert('Ошибка', String(err.message)));
            }}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Возврат</Text>
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Магазин подтвердил возврат"
            variant="secondary"
            onPress={() => {
              const id = requireSession();
              if (!id) return;
              void mock
                .approveRefund(id)
                .then(() => refreshSession(id))
                .catch((err) => Alert.alert('Ошибка', String(err.message)));
            }}
          />
          <Button
            title="Возврат проведён"
            variant="secondary"
            onPress={() => {
              const id = requireSession();
              if (!id) return;
              void mock
                .completeRefund(id)
                .then(() => refreshSession(id))
                .catch((err) => Alert.alert('Ошибка', String(err.message)));
            }}
          />
        </View>
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Журнал событий</Text>
        {events.length === 0 ? <Text style={{ color: colors.textMuted }}>Пока пусто</Text> : null}
        {events.map((event) => (
          <Text key={event.id} style={{ color: colors.text, fontSize: 13 }}>
            {event.actor}: {event.action} — {event.result}
          </Text>
        ))}
      </Card>

      <Button
        title="Сбросить демо"
        variant="danger"
        onPress={() => {
          Alert.alert('Сбросить состояние?', '', [
            { text: 'Нет', style: 'cancel' },
            {
              text: 'Сбросить',
              style: 'destructive',
              onPress: () => {
                void mock.reset().then(() => {
                  useUiStore.getState().setActiveSession(null);
                  useUiStore.getState().setCheckoutSnapshot(null);
                  useUiStore.getState().setAcknowledgedVersion(null);
                  queryClient.clear();
                  router.replace('/');
                });
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}
