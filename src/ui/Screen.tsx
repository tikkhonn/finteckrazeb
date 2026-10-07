import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from './tokens';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, scroll = true, footer, style }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={[styles.flex, style]}>
        {content}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
  },
});
