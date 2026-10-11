import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { findWallet } from '@/features/hubContent';
import { Button, Screen, radius, spacing, useTheme } from '@/ui';

export default function MockAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wallet = findWallet(id ?? '');
  const { colors } = useTheme();

  if (!wallet) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Счёт не найден.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: wallet.name }} />
      <View style={[styles.hero, { backgroundColor: wallet.tint }]}>
        <Text style={styles.mark}>{wallet.mark}</Text>
        <Text style={styles.bank}>{wallet.bank}</Text>
        <Text style={styles.meta}>•• {wallet.last4}</Text>
      </View>
      <Text style={[styles.caption, { color: colors.textMuted }]}>{wallet.caption}</Text>
      <Text style={[styles.body, { color: colors.text }]}>
        Это демо-счёт другого банка. Списания Scan & Go идут только с карты ВТБ текущего профиля.
      </Text>
      <Button title="Скоро в Scan & Go" onPress={() => router.navigate('/scan-and-go')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xxl,
    minHeight: 140,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    gap: 4,
  },
  mark: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  bank: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
  },
  caption: {
    fontSize: 13,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
