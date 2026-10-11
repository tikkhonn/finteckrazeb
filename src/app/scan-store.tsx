import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { getApi, isMockApi } from '@/api/apiProvider';
import { DEMO_STORE, findStoreById } from '@/api/mock/stores';
import { isVtbGoError } from '@/domain/errors';
import { assertStoreMatches } from '@/domain/storeGate';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { useStartSession } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Button, Card, Screen, spacing, useTheme } from '@/ui';

function ScanStoreBody({ storeId }: { storeId?: string }) {
  const { colors } = useTheme();
  const expected = storeId ? findStoreById(storeId) : undefined;
  const prefilledQr = expected?.qr ?? (isMockApi ? DEMO_STORE.qr : '');
  const [code, setCode] = useState(prefilledQr);
  const [error, setError] = useState<string | null>(null);
  const start = useStartSession();
  const setActiveSession = useUiStore((s) => s.setActiveSession);
  const autoConnected = useRef(false);
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const connect = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        return;
      }
      setCode(trimmed);
      setError(null);
      try {
        const store = assertStoreMatches(await getApi().getStore(trimmed), expected?.id);
        const session = await start.mutateAsync(store.id);
        setActiveSession(session.id);
        router.replace(`/session/${session.id}/cart`);
      } catch (err) {
        setError(isVtbGoError(err) ? err.message : 'Не удалось открыть магазин');
      }
    },
    [expected, setActiveSession, start],
  );

  useEffect(() => {
    if (!isMockApi || !expected || autoConnected.current || !prefilledQr) {
      return;
    }
    autoConnected.current = true;
    void connect(prefilledQr);
  }, [connect, expected, prefilledQr]);

  return (
    <Screen>
      {expected ? (
        <Card variant="elevated">
          <Text style={[styles.store, { color: colors.text }]}>{expected.name}</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>{expected.address}</Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            {isMockApi
              ? 'Демо: можно отсканировать QR или дождаться автоматического входа.'
              : 'Отсканируйте QR «Покупки через ВТБ Go» на входе — откроется каталог этого магазина.'}
          </Text>
        </Card>
      ) : null}
      {focused ? (
        <BarcodeScanner
          hint="Наведите камеру на QR «Покупки через ВТБ Go»"
          onScan={(value) => void connect(value)}
        />
      ) : null}
      <Text style={[styles.muted, { color: colors.textMuted }]}>Или введите код вручную</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder={expected?.qr ?? DEMO_STORE.qr}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
        ]}
      />
      <Button title="Подключиться" onPress={() => void connect(code)} loading={start.isPending} />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

export default function ScanStoreScreen() {
  const { storeId } = useLocalSearchParams<{ storeId?: string }>();
  return <ScanStoreBody key={storeId ?? 'any'} storeId={storeId} />;
}

const styles = StyleSheet.create({
  store: { fontSize: 18, fontWeight: '700' },
  muted: { fontSize: 15 },
  error: { fontSize: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
  },
});
