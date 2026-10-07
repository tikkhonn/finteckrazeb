import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { colors, radius, spacing } from './tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = VARIANT_STYLES[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed && !isDisabled ? palette.pressed : palette.bg },
        isDisabled ? styles.disabled : null,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.spinner} />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const VARIANT_STYLES: Record<Variant, { bg: string; pressed: string; fg: string; spinner: string }> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: '#FFFFFF', spinner: '#FFFFFF' },
  secondary: { bg: colors.chip, pressed: colors.border, fg: colors.primary, spinner: colors.primary },
  ghost: { bg: 'transparent', pressed: colors.chip, fg: colors.primary, spinner: colors.primary },
  danger: { bg: colors.danger, pressed: '#B71C1C', fg: '#FFFFFF', spinner: '#FFFFFF' },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '600' },
});
