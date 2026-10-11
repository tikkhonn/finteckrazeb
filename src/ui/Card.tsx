import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from './theme';
import { radius, spacing } from './tokens';

type CardVariant = 'default' | 'elevated' | 'featured';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors, gradients, shadow } = useTheme();

  if (variant === 'featured') {
    return (
      <LinearGradient
        colors={[...gradients.featured]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.featured, shadow.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        variant === 'elevated'
          ? [{ borderWidth: 0 }, shadow.card]
          : { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featured: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
