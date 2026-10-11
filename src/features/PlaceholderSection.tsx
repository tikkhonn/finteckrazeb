import { StyleSheet, Text, View } from 'react-native';

import { AnimatedEnter, Card, Chip, Screen, spacing, useTheme } from '@/ui';

interface PlaceholderSectionProps {
  title: string;
  subtitle: string;
  bullets: string[];
  inTabs?: boolean;
}

export function PlaceholderSection({
  title,
  subtitle,
  bullets,
  inTabs = false,
}: PlaceholderSectionProps) {
  const { colors, typography } = useTheme();
  return (
    <Screen background="sky" edges={inTabs ? ['top'] : ['bottom']} tabInset={inTabs}>
      <AnimatedEnter index={0}>
        <View style={styles.titleRow}>
          <Text style={typography.title}>{title}</Text>
          <Chip label="Скоро" variant="default" disabled />
        </View>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <Card variant="featured">
          <Text style={styles.featuredTitle}>{title}</Text>
          <Text style={styles.featuredSubtitle}>{subtitle}</Text>
          <Chip label="Скоро" variant="onDark" disabled />
        </Card>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <Card variant="elevated">
          {bullets.map((line) => (
            <View key={line} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.text, typography.body]}>{line}</Text>
            </View>
          ))}
        </Card>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Раздел в разработке. Покупка сейчас работает во вкладке Scan & Go.
        </Text>
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  text: { flex: 1 },
  footer: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
