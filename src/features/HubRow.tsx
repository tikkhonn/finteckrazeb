import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@/ui';

import { HubIcon } from './HubIcon';
import type { HubGlyph } from './hubIcons';

type RowProps = {
  title: string;
  subtitle?: string;
  glyph?: HubGlyph;
  right?: string;
  divider?: boolean;
  onPress: () => void;
};

export function HubRow({ title, subtitle, glyph, right, divider, onPress }: RowProps) {
  const { colors } = useTheme();
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {glyph ? <HubIcon {...glyph} /> : null}
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <Text style={[styles.right, { color: colors.textMuted }]}>{right}</Text> : null}
        <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
      </Pressable>
      {divider ? (
        <View
          style={[
            styles.hair,
            { backgroundColor: colors.border, marginLeft: glyph ? 60 : spacing.md },
          ]}
        />
      ) : null}
    </View>
  );
}

export function HubGroup({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.group, { backgroundColor: colors.surface }]}>{children}</View>;
}

export function HubSection({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.section, { color: colors.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  section: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18 },
  right: { fontSize: 13 },
  chevron: { fontSize: 22, lineHeight: 24, fontWeight: '500' },
  hair: { height: StyleSheet.hairlineWidth },
});
