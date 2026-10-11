import { Switch, StyleSheet, Text, View } from 'react-native';

import { spacing, useTheme } from '@/ui';

import { HubIcon } from './HubIcon';
import type { HubGlyph } from './hubIcons';

type Props = {
  title: string;
  subtitle?: string;
  glyph?: HubGlyph;
  divider?: boolean;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function HubToggle({ title, subtitle, glyph, divider, value, onValueChange }: Props) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.row}>
        {glyph ? <HubIcon {...glyph} /> : null}
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18 },
  hair: { height: StyleSheet.hairlineWidth },
});
