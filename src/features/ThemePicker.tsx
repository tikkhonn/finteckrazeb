import { Pressable, StyleSheet, Text, View } from 'react-native';

import { THEME_PREFERENCES, type ThemePreference } from '@/domain/theme';
import { palettes, spacing, useTheme } from '@/ui';

const LABELS: Record<ThemePreference, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Как в системе',
};

function PhonePreview({ mode, border }: { mode: ThemePreference; border: string }) {
  const light = palettes.light;
  const dark = palettes.dark;
  const split = mode === 'system';
  const bg = mode === 'dark' ? dark.bg : light.bg;
  const card = mode === 'dark' ? dark.surface : light.surface;
  const bar = mode === 'dark' ? dark.primary : light.primary;

  return (
    <View style={[styles.phone, { backgroundColor: split ? light.bg : bg, borderColor: border }]}>
      {split ? <View style={[styles.splitDark, { backgroundColor: dark.bg }]} /> : null}
      <View style={[styles.status, { backgroundColor: split ? light.primary : bar }]} />
      <View style={[styles.block, { backgroundColor: split ? light.surface : card, left: 8, top: 22, width: 28 }]} />
      <View
        style={[
          styles.block,
          { backgroundColor: split ? dark.surface : card, right: 8, top: 28, width: 22, height: 36 },
        ]}
      />
      <View
        style={[styles.block, { backgroundColor: split ? light.accent : bar, left: 8, top: 48, width: 28 }]}
      />
    </View>
  );
}

export function ThemePicker() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <View style={styles.wrap}>
      {THEME_PREFERENCES.map((item) => {
        const active = item === preference;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setPreference(item)}
            style={styles.col}
          >
            <PhonePreview mode={item} border={colors.border} />
            <Text style={[styles.caption, { color: colors.text }]}>{LABELS[item]}</Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : 'transparent',
                },
              ]}
            >
              {active ? <Text style={styles.check}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  phone: {
    width: '100%',
    maxWidth: 92,
    aspectRatio: 0.62,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  splitDark: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
  },
  status: {
    height: 8,
    margin: 8,
    borderRadius: 4,
  },
  block: {
    position: 'absolute',
    height: 14,
    borderRadius: 4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
