import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './tokens';

interface ListRowProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, right, onPress }: ListRowProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
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
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  pressed: { opacity: 0.7 },
});
