import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, spacing, useTheme } from '@/ui';

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>ВТБ Go</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>Версия {VERSION}</Text>
      <Text style={[styles.body, { color: colors.text }]}>
        Демо-приложение хакатона: Scan & Go, карта ВТБ и профильный хаб. Платежи, справки и
        поддержка не уходят в банк.
      </Text>
      <Button title="Демо-панель" variant="secondary" onPress={() => router.push('/demo-panel')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    fontSize: 15,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
});
