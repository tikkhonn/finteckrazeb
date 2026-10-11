import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, radius, spacing, useTheme } from '@/ui';

type Props = {
  onPress: () => void;
};

/** Упрощённый QR: три маркера поиска и несколько модулей данных. */
const QR = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 0, 1],
] as const;

function QrGlyph({ color, size }: { color: string; size: number }) {
  const gap = size > 28 ? 1.5 : 1;
  const cell = (size - gap * 6) / 7;

  return (
    <View style={{ width: size, height: size, gap }}>
      {QR.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row', gap }}>
          {row.map((on, x) => (
            <View
              key={x}
              style={{
                width: cell,
                height: cell,
                borderRadius: 1,
                backgroundColor: on ? color : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function ScanGoHero({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Сканировать QR магазина"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card variant="featured" style={styles.card}>
        <View style={styles.top}>
          <View style={styles.copy}>
            <Text style={styles.kicker}>Оплата без кассы</Text>
            <Text style={styles.title}>Scan & Go</Text>
            <Text style={styles.lead}>
              Наведите камеру на QR у входа — откроется корзина этого магазина
            </Text>
          </View>
          <View style={styles.badge}>
            <QrGlyph color="#FFFFFF" size={52} />
          </View>
        </View>
        <View style={[styles.cta, { backgroundColor: colors.onPrimary }]}>
          <QrGlyph color={colors.primary} size={20} />
          <Text style={[styles.ctaLabel, { color: colors.primary }]}>Сканировать QR</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  card: {
    minHeight: 188,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lead: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    minHeight: 48,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
