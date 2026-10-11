import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from './theme';
import { TAB_ISLAND_CLEARANCE, contentPad, spacing } from './tokens';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  style?: ViewStyle;
  background?: 'plain' | 'sky';
  edges?: Edge[];
  tabInset?: boolean;
}

export function Screen({
  children,
  scroll = true,
  footer,
  style,
  background = 'plain',
  edges = ['top', 'bottom'],
  tabInset = false,
}: ScreenProps) {
  const { colors, gradients } = useTheme();
  const contentStyle = [
    styles.content,
    tabInset ? { paddingBottom: TAB_ISLAND_CLEARANCE } : null,
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, styles.flex]}>{children}</View>
  );

  const inner = (
    <View style={[styles.flex, style]}>
      {content}
      {footer ? (
        <View style={[styles.footer, tabInset ? { paddingBottom: TAB_ISLAND_CLEARANCE - 24 } : null]}>
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={edges}>
      {background === 'sky' ? (
        <LinearGradient
          colors={[...gradients.sky]}
          style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        />
      ) : null}
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: contentPad,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    flexGrow: 0,
  },
  footer: {
    paddingHorizontal: contentPad,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
});
