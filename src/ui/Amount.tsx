import { StyleSheet, Text } from 'react-native';

import { formatRub } from '@/domain/money';
import { typography } from './tokens';

interface AmountProps {
  value: number;
  size?: 'md' | 'lg';
}

export function Amount({ value, size = 'lg' }: AmountProps) {
  return (
    <Text style={size === 'lg' ? styles.lg : styles.md} accessibilityLabel={formatRub(value)}>
      {formatRub(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  lg: typography.amount,
  md: typography.amountMd,
});
