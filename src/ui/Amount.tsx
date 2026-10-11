import { Text } from 'react-native';

import { formatRub } from '@/domain/money';

import { useTheme } from './theme';

interface AmountProps {
  value: number;
  size?: 'md' | 'lg';
}

export function Amount({ value, size = 'lg' }: AmountProps) {
  const { typography } = useTheme();
  return (
    <Text
      style={size === 'lg' ? typography.amount : typography.amountMd}
      accessibilityLabel={formatRub(value)}
    >
      {formatRub(value)}
    </Text>
  );
}
