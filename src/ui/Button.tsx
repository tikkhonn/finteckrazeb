import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { pressSpring } from './motion';
import { useTheme } from './theme';
import { radius, spacing } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  shape?: 'rounded' | 'pill';
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  shape = 'pill',
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary, spinner: colors.onPrimary },
    secondary: { bg: colors.chip, pressed: colors.border, fg: colors.primary, spinner: colors.primary },
    ghost: { bg: 'transparent', pressed: colors.chip, fg: colors.primary, spinner: colors.primary },
    danger: { bg: colors.danger, pressed: '#B71C1C', fg: colors.onPrimary, spinner: colors.onPrimary },
  }[variant];
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backgroundColor = pressed && !isDisabled ? palette.pressed : palette.bg;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isDisabled}
      style={[
        styles.base,
        shape === 'pill' ? styles.pill : styles.rounded,
        { backgroundColor },
        Platform.OS === 'web' ? styles.web : null,
        isDisabled ? styles.disabled : null,
        animatedStyle,
      ]}
      onPressIn={(e) => {
        if (!isDisabled) {
          setPressed(true);
          // Shared value updates run on the UI thread (Reanimated).
          // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
          scale.value = withSpring(0.97, pressSpring);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withSpring(1, pressSpring);
        onPressOut?.(e);
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.spinner} />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pill: {
    borderRadius: radius.pill,
  },
  rounded: {
    borderRadius: radius.md,
  },
  disabled: { opacity: 0.5 },
  web: { cursor: 'pointer', alignSelf: 'stretch' } as ViewStyle,
  label: { fontSize: 15, fontWeight: '600' },
});
