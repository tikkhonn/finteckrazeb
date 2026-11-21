import { StyleSheet, Text, View } from 'react-native';

import { CUSTOMER_SPOT_CHECK_NOTICE } from '@/domain/risk/scoreVisit';
import { Card, spacing, useTheme } from '@/ui';

export function SpotCheckNotice() {
  const { colors } = useTheme();
  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Точка выхода</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{CUSTOMER_SPOT_CHECK_NOTICE}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});