import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { getApi } from '@/api/apiProvider';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { useStartSession } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Button, Screen, colors, spacing } from '@/ui';
import { isVtbGoError } from '@/domain/errors';

export default function ScanStoreScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const start = useStartSession();
  const setActiveSession = useUiStore((s) => s.setActiveSession);

  async function connect(raw: string) {
    setError(null);
    try {
      const store = await getApi().getStore(raw);
      const session = await start.mutateAsync(store.id);
      setActiveSession(session.id);
      router.replace(`/session/${session.id}/cart`);
    } catch (err) {
      setError(isVtbGoError(err) ? err.message : 'Не удалось открыть магазин');
    }
  }

  return (
    <Screen>
      <BarcodeScanner
        hint="Наведите камеру на QR «Покупки через ВТБ Go»"
        onScan={(value) => void connect(value)}
      />
      <Text style={{ color: colors.textMuted }}>Или введите код вручную</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="VTBGO-STORE-UDOMA"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
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
      <Button title="Подключиться" onPress={() => void connect(code)} loading={start.isPending} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Screen>
  );
}
