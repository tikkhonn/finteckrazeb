import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, useTheme } from '@/ui';

const CASH_ACTIONS = [
  { id: 'withdraw', label: 'Снять', glyph: '↓', href: '/account/cash?kind=withdraw' },
  { id: 'topup', label: 'Пополнить', glyph: '+', href: '/account/cash?kind=topup' },
] as const;

export function AccountActions() {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Оплатить"
        onPress={() => router.push('/scan-store')}
        style={({ pressed }) => [styles.primaryItem, pressed && styles.pressed]}
      >
        <View style={[styles.primaryCircle, { backgroundColor: colors.island }]}>
          <Text style={[styles.primaryGlyph, { color: colors.onPrimary }]}>▣</Text>
        </View>
        <Text style={[styles.primaryLabel, { color: colors.text }]}>Оплатить</Text>
      </Pressable>

      <View style={styles.phaseBlock}>
        <Text style={[styles.phaseKicker, { color: colors.textMuted }]}>
          Следующий шаг: наличные в точке по QR
        </Text>
        <View style={styles.cashRow}>
          {CASH_ACTIONS.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [styles.cashItem, pressed && styles.pressed]}
            >
              <View style={[styles.cashCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cashGlyph, { color: colors.primary }]}>{item.glyph}</Text>
              </View>
              <Text style={[styles.cashLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.7 },
  primaryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryGlyph: {
    fontSize: 22,
    fontWeight: '600',
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  phaseBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  phaseKicker: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  cashItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: 72,
  },
  cashCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashGlyph: {
    fontSize: 18,
    fontWeight: '600',
  },
  cashLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});