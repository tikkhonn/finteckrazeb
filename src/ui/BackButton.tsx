import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { pressSpring } from './motion';
import { useTheme } from './theme';
import { spacing } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BackButtonProps {
  onPress?: () => void;
  canGoBack?: boolean;
}

export function BackButton({ onPress, canGoBack = true }: BackButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!canGoBack) {
    return null;
  }

  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    router.back();
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Назад"
      onPress={handlePress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withSpring(0.97, pressSpring);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withSpring(1, pressSpring);
      }}
      style={[styles.button, animatedStyle]}
    >
      {Platform.OS === 'web' ? (
        <Text style={[styles.chevron, { color: colors.primary }]}>‹</Text>
      ) : (
        <SymbolView name="chevron.left" tintColor={colors.primary} size={16} weight="semibold" />
      )}
      <Text style={[styles.label, { color: colors.primary }]}>Назад</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: spacing.sm,
    paddingVertical: 8,
    paddingRight: spacing.sm,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: -1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
