import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { pressSpring } from './motion';
import { useTheme } from './theme';
import { radius, spacing } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ChipProps = {
  label: string;
  variant?: 'default' | 'onDark';
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, variant = 'default', disabled, onPress, style }: ChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const palette =
    variant === 'onDark'
      ? { bg: colors.chipOnDark, fg: colors.onPrimary }
      : { bg: colors.chip, fg: colors.primary };

  const visual = [
    styles.chip,
    { backgroundColor: palette.bg, opacity: disabled ? 0.5 : 1 },
    style,
  ];
  const labelNode = <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>;

  if (!onPress) {
    return <View style={visual}>{labelNode}</View>;
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[visual, animatedStyle]}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withSpring(0.97, pressSpring);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withSpring(1, pressSpring);
      }}
    >
      {labelNode}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
