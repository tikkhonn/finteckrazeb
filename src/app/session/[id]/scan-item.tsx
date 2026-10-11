import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { useAddItem } from '@/queries/hooks';
import { Button, Screen, spacing, useTheme } from '@/ui';

export default function ScanItemScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addItem = useAddItem(id);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  async function add(barcode: string) {
    setError(null);
    setNotFound(false);
    try {
      await addItem.mutateAsync(barcode.trim());
      router.back();
    } catch (err) {
      if (isVtbGoError(err) && err.code === 'ITEM_NOT_FOUND') {
        setNotFound(true);
        setError(err.message);
        return;
      }
      setError(isVtbGoError(err) ? err.message : 'Не удалось добавить товар');
    }
  }

  return (
    <Screen>
      {focused ? (
        <BarcodeScanner
          hint="Наведите камеру на штрихкод товара"
          onScan={(value) => void add(value)}
        />
      ) : null}
      <Text style={{ color: colors.textMuted }}>Или введите EAN-13 вручную</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        placeholder="4600000000000"
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
      <Button title="Добавить" loading={addItem.isPending} onPress={() => void add(code)} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {notFound ? (
        <View style={{ gap: spacing.sm }}>
          <Button title="Позвать сотрудника" variant="secondary" onPress={() => router.push('/help')} />
        </View>
      ) : null}
    </Screen>
  );
}
