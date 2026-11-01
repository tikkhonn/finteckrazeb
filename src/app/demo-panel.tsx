import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { getMockApi, isMockApi } from '@/api/apiProvider';
import { APPLE_SCALE_CODE, DEMO_COLA, DEMO_ENERGY, payloadForDemo } from '@/api/mock/demoSkus';
import { isVtbGoError } from '@/domain/errors';
import type { CatalogItem, CatalogPreset, PaymentSimMode, ReceiptSimMode } from '@/domain/types';
import { applyFlipHide } from '@/features/applyFlipHide';
import { DemoCatalogEditor } from '@/features/DemoCatalogEditor';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useDemoStore } from '@/store/demoStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useUiStore } from '@/store/uiStore';
import { Button, Card, Screen, spacing, useTheme } from '@/ui';

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
  const { colors } = useTheme();
  const mock = getMockApi();
  const sessionId = useUiStore((s) => s.activeSessionId);
  const paymentMode = useDemoStore((s) => s.paymentMode);
  const receiptMode = useDemoStore((s) => s.receiptMode);
  const catalogMode = useDemoStore((s) => s.catalogMode);
  const setPaymentMode = useDemoStore((s) => s.setPaymentMode);
  const setReceiptMode = useDemoStore((s) => s.setReceiptMode);
  const hideBalances = usePrefsStore((s) => s.hideBalances);
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => mock?.getCatalog() ?? []);

  if (!isMockApi || !mock) {
    return (
      <Screen>
        <Text style={{ color: colors.text }}>Демо-панель доступна только с mock-адаптером.</Text>
      </Screen>
    );
  }

  const api = mock;
  const events = api.listEvents(sessionId ?? undefined).slice(-12).reverse();

  function requireSession(): string | null {
    if (!sessionId) {
      Alert.alert('Нет активной сессии', 'Сначала начните покупку.');
      return null;
    }
    return sessionId;
  }

  const mutateCatalog = async (action: () => Promise<unknown>) => {
    await action();
    setCatalog(api.getCatalog());
  };

  const switchCatalog = async (preset: CatalogPreset) => {
    if (preset === catalogMode) {
      return;
    }
    try {
      await api.setCatalogPreset(preset);
      setCatalog(api.getCatalog());
    } catch (err) {
      Alert.alert('Каталог', isVtbGoError(err) ? err.message : 'Не удалось сменить базу');
    }
  };

  const addPayload = (raw: string, asCashier = false, ensureFull = false) => {
    const activeId = requireSession();
    if (!activeId) return;
    void (async () => {
      if (ensureFull && useDemoStore.getState().catalogMode !== 'full') {
        await api.setCatalogPreset('full');
        setCatalog(api.getCatalog());
      }
      if (asCashier) {
        await api.cashierAddItem(activeId, raw);
      } else {
        await api.addItem(activeId, raw);
      }
      await refreshSession(activeId);
    })().catch((err) => Alert.alert('Ошибка', isVtbGoError(err) ? err.message : String(err)));
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Демо-панель</Text>
      <Text style={{ color: colors.textMuted }}>
        Сессия: {sessionId ?? 'нет'} · долгое нажатие на «ВТБ Go» открывает эту панель
      </Text>

      <DemoCatalogEditor
        catalog={catalog}
        onSave={(item) => mutateCatalog(() => mock.upsertCatalogItem(item))}
        onDelete={(barcode) => mutateCatalog(() => mock.deleteCatalogItem(barcode))}
        onReset={() => mutateCatalog(() => mock.resetCatalog())}
      />

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Каталог магазина</Text>
        <Button
          title="Базовый (8 товаров)"
          variant={catalogMode === 'basic' ? 'primary' : 'secondary'}
          onPress={() => void switchCatalog('basic')}
        />
        <Button
          title="Полная база (50 товаров)"
          variant={catalogMode === 'full' ? 'primary' : 'secondary'}
          onPress={() => void switchCatalog('full')}
        />
        <Button title="Загрузить базу 50 товаров" variant="ghost" onPress={() => void switchCatalog('full')} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Быстрый скан</Text>
        <Button
          title="Симулировать скан акциза DataMatrix"
          variant="secondary"
          onPress={() => addPayload(payloadForDemo(DEMO_COLA), false, true)}
        />
        <Button
          title="+ Энергетик 18+ (Акциз)"
          variant="secondary"
          onPress={() => addPayload(payloadForDemo(DEMO_ENERGY), false, true)}
        />
        <Button title="+ Весовые яблоки 450г" variant="secondary" onPress={() => addPayload(APPLE_SCALE_CODE, false, true)} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Скрытие баланса</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          Сейчас {hideBalances ? 'скрыт' : 'виден'}. Кнопка = тот же жест переворота.
        </Text>
        <Button title="Имитировать переворот" variant="secondary" onPress={applyFlipHide} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Режим платежа</Text>
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
        <Text style={{ fontWeight: '700', color: colors.text }}>Режим чека</Text>
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
        <Text style={{ fontWeight: '700', color: colors.text }}>Кассир добавил товар</Text>
        {catalog.map((item) => (
          <Button
            key={`c-${item.barcode}`}
            title={item.name}
            variant="secondary"
            onPress={() => addPayload(payloadForDemo(item), true)}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Добавить в корзину (без камеры)</Text>
        {catalog.map((item) => (
          <Button
            key={`a-${item.barcode}`}
            title={item.name}
            variant="ghost"
            onPress={() => addPayload(payloadForDemo(item))}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Возврат</Text>
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
        <Text style={{ fontWeight: '700', color: colors.text }}>Журнал событий</Text>
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
