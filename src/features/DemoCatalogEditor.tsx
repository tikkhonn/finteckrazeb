import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { isVtbGoError } from '@/domain/errors';
import { formatRub } from '@/domain/money';
import type { CatalogItem } from '@/domain/types';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { Button, Card, radius, spacing, useTheme } from '@/ui';

interface DemoCatalogEditorProps {
  catalog: CatalogItem[];
  onSave: (item: CatalogItem) => Promise<unknown>;
  onDelete: (barcode: string) => Promise<void>;
  onReset: () => Promise<void>;
}

const EMPTY_FORM = { barcode: '', name: '', price: '' };

export function DemoCatalogEditor({ catalog, onSave, onDelete, onReset }: DemoCatalogEditorProps) {
  const { colors } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await onSave({
        barcode: form.barcode,
        name: form.name,
        price: Number(form.price.replace(',', '.')),
      });
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(isVtbGoError(err) ? err.message : 'Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  }

  function edit(item: CatalogItem) {
    setError(null);
    setForm({ barcode: item.barcode, name: item.name, price: String(item.price) });
  }

  function confirmDelete(item: CatalogItem) {
    Alert.alert('Удалить товар?', item.name, [
      { text: 'Нет', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => void onDelete(item.barcode) },
    ]);
  }

  function confirmReset() {
    Alert.alert('Вернуть исходный каталог?', 'Ваши товары будут удалены.', [
      { text: 'Нет', style: 'cancel' },
      { text: 'Вернуть', style: 'destructive', onPress: () => void onReset() },
    ]);
  }

  return (
    <Card>
      <Text style={[styles.title, { color: colors.text }]}>Каталог товаров</Text>
      <Text style={[styles.muted, { color: colors.textMuted }]}>
        Отсканируйте штрихкод товара, задайте название и цену. Тот же код найдётся в Scan & Go.
      </Text>

      {scanning ? (
        <BarcodeScanner
          hint="Наведите камеру на штрихкод"
          onScan={(value) => {
            update('barcode')(value);
            setScanning(false);
          }}
        />
      ) : null}
      {Platform.OS !== 'web' ? (
        <Button
          title={scanning ? 'Закрыть камеру' : 'Сканировать штрихкод'}
          variant="secondary"
          onPress={() => setScanning((prev) => !prev)}
        />
      ) : null}

      <TextInput
        value={form.barcode}
        onChangeText={update('barcode')}
        keyboardType="number-pad"
        placeholder="EAN-13"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
        ]}
      />
      <TextInput
        value={form.name}
        onChangeText={update('name')}
        placeholder="Название"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
        ]}
      />
      <TextInput
        value={form.price}
        onChangeText={update('price')}
        keyboardType="decimal-pad"
        placeholder="Цена, ₽"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
        ]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      <View style={styles.saveWrap}>
        <Button title="Сохранить товар" loading={saving} onPress={() => void save()} />
      </View>

      {catalog.map((item) => (
        <View key={item.barcode} style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {item.barcode} · {formatRub(item.price)}
            </Text>
          </View>
          <View style={styles.rowActions}>
            <Button title="Изменить" variant="ghost" onPress={() => edit(item)} />
            <Button title="Удалить" variant="ghost" onPress={() => confirmDelete(item)} />
          </View>
        </View>
      ))}

      <Button title="Вернуть исходный каталог" variant="danger" onPress={confirmReset} />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700' },
  muted: { fontSize: 13 },
  error: { fontSize: 13 },
  saveWrap: { marginTop: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
  },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { gap: 2 },
  name: { fontSize: 15, fontWeight: '600' },
  rowActions: { flexDirection: 'row', gap: spacing.sm },
});
