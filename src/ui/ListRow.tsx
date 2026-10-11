import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme';
import { spacing } from './tokens';

interface ListRowProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, right, chevron, onPress }: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
      {chevron ? <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => (pressed ? styles.pressed : null)}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  chevron: { fontSize: 22, lineHeight: 24, fontWeight: '500' },
  pressed: { opacity: 0.7 },
});
