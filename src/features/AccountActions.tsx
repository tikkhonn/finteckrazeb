import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, useTheme } from '@/ui';

const ACTIONS = [
  { id: 'withdraw', label: 'Снять', glyph: '↓', href: '/account/cash?kind=withdraw' },
  { id: 'topup', label: 'Пополнить', glyph: '+', href: '/account/cash?kind=topup' },
  { id: 'pay', label: 'Оплатить', glyph: '▣', href: '/scan-store' },
] as const;

export function AccountActions() {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {ACTIONS.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={() => router.push(item.href)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <View style={[styles.circle, { backgroundColor: colors.island }]}>
            <Text style={[styles.glyph, { color: colors.onPrimary }]}>{item.glyph}</Text>
          </View>
          <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: 6,
    minWidth: 76,
  },
  pressed: { opacity: 0.7 },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 22,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
