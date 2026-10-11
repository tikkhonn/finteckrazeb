import { SymbolView } from 'expo-symbols';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enterZoom, spacing, useTheme } from '@/ui';

type Props = {
  animate?: boolean;
  size?: 'md' | 'lg';
};

export function SuccessCheckBadge({ animate = true, size = 'lg' }: Props) {
  const { colors } = useTheme();
  const ring = size === 'lg' ? 72 : 56;
  const iconSize = size === 'lg' ? 44 : 34;

  const icon = (
    <View
      style={[
        styles.ring,
        {
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          backgroundColor: colors.successBg,
        },
      ]}
    >
      {Platform.OS === 'web' ? (
        <Text style={[styles.glyph, { color: colors.success, fontSize: size === 'lg' ? 36 : 28 }]}>
          ✓
        </Text>
      ) : (
        <SymbolView name="checkmark.circle.fill" tintColor={colors.success} size={iconSize} weight="semibold" />
      )}
    </View>
  );

  if (!animate) {
    return (
      <View accessibilityLabel="Успешно" accessibilityRole="image">
        {icon}
      </View>
    );
  }

  return (
    <Animated.View entering={enterZoom} accessibilityLabel="Успешно" accessibilityRole="image">
      {icon}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  glyph: {
    fontWeight: '800',
  },
});
