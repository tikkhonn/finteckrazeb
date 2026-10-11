import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { enterStagger } from './motion';
import { spacing } from './tokens';

interface AnimatedEnterProps {
  index: number;
  children: ReactNode;
}

export function AnimatedEnter({ index, children }: AnimatedEnterProps) {
  return (
    <Animated.View entering={enterStagger(index)} style={styles.block}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%', gap: spacing.sm },
});
