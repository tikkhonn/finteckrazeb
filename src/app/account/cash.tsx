import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EMPTY_QR, INSUFFICIENT_FUNDS, INVALID_AMOUNT, type CashKind } from '@/domain/profile';
import { BarcodeScanner } from '@/features/BarcodeScanner';
import { useProfileStore } from '@/store/profileStore';
import { Button, Card, Chip, Screen, radius, spacing, useTheme } from '@/ui';

const PRESETS = [1000, 3000, 5000, 10000];

function parseKind(value: string | undefined): CashKind {
  return value === 'topup' ? 'topup' : 'withdraw';
}

export default function CashQrScreen() {
  const { colors } = useTheme();
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();
  const kind = parseKind(kindParam);
  const applyCash = useProfileStore((s) => s.applyCash);
  const [amountText, setAmountText] = useState('');
  const [step, setStep] = useState<'amount' | 'scan'>('amount');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(true);
  const busy = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const title = kind === 'topup' ? 'Пополнить по QR' : 'Снять по QR';
  const amount = Number.parseInt(amountText.replace(/\D/g, ''), 10);

  function goScan() {
    setError(null);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Укажите сумму в рублях');
      return;
    }
    setStep('scan');
  }

  function submit(raw: string) {
    if (busy.current) {
      return;
    }
    const qr = raw.trim();
    setCode(qr);
    setError(null);
    try {
      busy.current = true;
      const op = applyCash(kind, amount, qr);
      router.replace({ pathname: '/account/op/[id]', params: { id: op.id, celebrate: '1' } });
    } catch (err) {
      busy.current = false;
      const codeName = err instanceof Error ? err.message : '';
      if (codeName === INSUFFICIENT_FUNDS) {
        setError('Недостаточно средств');
        setStep('amount');
        return;
      }
      if (codeName === INVALID_AMOUNT) {
        setError('Укажите сумму в рублях');
        setStep('amount');
        return;
      }
      if (codeName === EMPTY_QR) {
        setError('Отсканируйте или введите код');
        return;
      }
      setError('Не удалось провести операцию');
    }
  }

  return (
    <Screen>
      <Text style={[styles.kicker, { color: colors.textMuted }]}>{title}</Text>
      {step === 'amount' ? (
        <>
          <Card variant="elevated">
            <Text style={[styles.label, { color: colors.text }]}>Сумма, ₽</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
              ]}
            />
            <View style={styles.presets}>
              {PRESETS.map((value) => (
                <Chip
                  key={value}
                  label={`${value.toLocaleString('ru-RU')} ₽`}
                  onPress={() => setAmountText(String(value))}
                />
              ))}
            </View>
          </Card>
          <Button title="Дальше — сканировать QR" onPress={goScan} />
        </>
      ) : (
        <>
          <Card variant="elevated">
            <Text style={[styles.label, { color: colors.text }]}>
              {kind === 'topup' ? 'Зачисление' : 'Снятие'}: {amount.toLocaleString('ru-RU')} ₽
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>В демо подойдёт любой непустой QR.</Text>
          </Card>
          {focused ? (
            <BarcodeScanner
              hint="Наведите камеру на QR для снятия или пополнения"
              onScan={(value) => submit(value)}
            />
          ) : null}
          <Text style={[styles.hint, { color: colors.textMuted }]}>Или введите код вручную</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="VTB-CASH-DEMO"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={[
              styles.codeInput,
              { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
            ]}
          />
          <Button title="Подтвердить" onPress={() => submit(code)} />
          <Button title="Изменить сумму" variant="ghost" onPress={() => setStep('amount')} />
        </>
      )}
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 13 },
  error: { fontSize: 13 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 22,
    fontWeight: '700',
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
});
