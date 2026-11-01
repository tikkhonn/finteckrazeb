import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { getMockApi } from '@/api/apiProvider';
import { APPLE_SCALE_CODE, DEMO_ENERGY } from '@/api/mock/demoSkus';
import { isVtbGoError } from '@/domain/errors';
import { demoExciseMark, parseScannedCode } from '@/domain/scanner/barcodeParser';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { useAddItem } from '@/queries/hooks';
import { useDemoStore } from '@/store/demoStore';
import { useActiveProfile } from '@/store/profileStore';
import { useUiStore } from '@/store/uiStore';
import { BottomSheet, Button, Chip, Screen, spacing, useTheme } from '@/ui';

interface PendingExcise {
  barcode: string;
  name: string;
  isAdultOnly: boolean;
}

function pendingFromBarcode(barcode: string | undefined): PendingExcise | null {
  if (!barcode) {
    return null;
  }
  const product = getMockApi()?.getCatalog().find((item) => item.barcode === barcode);
  return {
    barcode,
    name: product?.name ?? 'Товар',
    isAdultOnly: product?.isAdultOnly === true,
  };
}

export default function ScanItemScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string; exciseBarcode?: string }>();
  const id = params.id;
  const exciseBarcode = Array.isArray(params.exciseBarcode) ? params.exciseBarcode[0] : params.exciseBarcode;
  const addItem = useAddItem(id);
  const profile = useActiveProfile();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [focused, setFocused] = useState(true);
  const [pending, setPending] = useState<PendingExcise | null>(() => pendingFromBarcode(exciseBarcode));
  const [ageOpen, setAgeOpen] = useState(false);
  const [ageMessage, setAgeMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    if (id) {
      useUiStore.getState().setActiveSession(id);
    }
  }, [id]);

  async function submit(raw: string, exciseCode?: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      return;
    }
    setError(null);
    setNotFound(false);

    if (!exciseCode) {
      const parsed = parseScannedCode(trimmed);
      if (parsed.type === 'store_qr') {
        setError('Это QR магазина, а не штрихкод товара.');
        return;
      }
      if (parsed.type === 'catalog_qr' || parsed.type === 'catalog_url') {
        const mock = getMockApi();
        if (!mock) {
          setError('Смена каталога доступна только в демо.');
          return;
        }
        try {
          await mock.getStore(trimmed);
          const notice = mock.takeCatalogNotice();
          Alert.alert('Каталог', notice ?? 'Каталог магазина обновлён.');
        } catch (err) {
          setError(isVtbGoError(err) ? err.message : 'Не удалось загрузить каталог');
        }
        return;
      }
    }

    try {
      await addItem.mutateAsync(exciseCode ? { raw: trimmed, exciseCode } : trimmed);
      router.back();
    } catch (err) {
      if (isVtbGoError(err) && err.code === 'AWAITING_EXCISE') {
        setPending({
          barcode: String(err.extras?.barcode ?? ''),
          name: String(err.extras?.name ?? 'Товар'),
          isAdultOnly: err.extras?.isAdultOnly === true,
        });
        return;
      }
      if (isVtbGoError(err) && err.code === 'AGE_RESTRICTED_18_PLUS') {
        setAgeMessage(err.message);
        setAgeOpen(true);
        setPending(null);
        return;
      }
      if (isVtbGoError(err) && err.code === 'ITEM_NOT_FOUND') {
        setNotFound(true);
      }
      setError(isVtbGoError(err) ? err.message : 'Не удалось добавить товар');
    }
  }

  function onScan(value: string) {
    if (!pending) {
      void submit(value);
      return;
    }
    const parsed = parseScannedCode(value);
    if (parsed.type === 'gs1' || parsed.type === 'ean13' || parsed.type === 'weighted') {
      void submit(value);
      return;
    }
    void submit(pending.barcode, value.trim());
  }

  async function quick(raw: string) {
    const mock = getMockApi();
    if (mock && useDemoStore.getState().catalogMode !== 'full') {
      try {
        await mock.setCatalogPreset('full');
      } catch (err) {
        setError(isVtbGoError(err) ? err.message : 'Не удалось открыть полную базу');
        return;
      }
    }
    await submit(raw);
  }

  const showAdultBadge = Boolean(pending?.isAdultOnly && profile.isAdultVerified);

  return (
    <Screen>
      {focused ? (
        <BarcodeScanner
          frame={pending ? 'excise' : 'barcode'}
          hint={
            pending
              ? 'Наведите камеру на QR или DataMatrix на крышке'
              : 'Наведите камеру на штрихкод товара'
          }
          onScan={onScan}
        />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Chip label="+ Энергетик 18+ (Акциз)" onPress={() => void quick(demoExciseMark(DEMO_ENERGY.barcode))} />
        <Chip label="+ Весовые яблоки 450г" onPress={() => void quick(APPLE_SCALE_CODE)} />
      </View>
      <Text style={{ color: colors.textMuted }}>Или введите EAN-13 вручную</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType={pending ? 'default' : 'number-pad'}
        placeholder={pending ? 'Код марки' : '4600000000000'}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: spacing.md,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: 16,
        }}
      />
      <Button
        title="Добавить"
        loading={addItem.isPending}
        onPress={() => void submit(pending ? pending.barcode : code, pending ? code : undefined)}
      />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {notFound ? <Button title="Позвать сотрудника" variant="secondary" onPress={() => router.push('/help')} /> : null}

      <BottomSheet visible={Boolean(pending)} title={pending?.name ?? 'Маркировка'} onClose={() => setPending(null)}>
        <Text style={{ color: colors.text }}>
          Товар подлежит обязательной маркировке. Наведите камеру на QR / DataMatrix на крышке или этикетке.
        </Text>
        {showAdultBadge ? (
          <Text style={{ color: colors.success, fontWeight: '700' }}>18+ подтверждено по паспорту ВТБ</Text>
        ) : null}
        <Button
          title="[Демо] Сгенерировать марку"
          variant="secondary"
          onPress={() => {
            if (!pending) return;
            void submit(demoExciseMark(pending.barcode));
          }}
        />
      </BottomSheet>

      <BottomSheet visible={ageOpen} title="Ограничение 18+" onClose={() => setAgeOpen(false)}>
        <Text style={{ color: colors.text }}>{ageMessage}</Text>
        <Button title="Понятно" onPress={() => setAgeOpen(false)} />
      </BottomSheet>
    </Screen>
  );
}
