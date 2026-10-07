import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PaymentMethod } from '@/domain/types';
import { colors, radius, spacing } from '@/ui';

const METHODS: { id: PaymentMethod; title: string; subtitle?: string }[] = [
  { id: 'card', title: 'Карта ВТБ •• 1234' },
  { id: 'sbp', title: 'СБП' },
  { id: 'digital_ruble', title: 'Цифровой рубль', subtitle: 'Демонстрационный режим' },
];

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <View style={styles.list}>
      {METHODS.map((method) => {
        const selected = method.id === value;
        return (
          <Pressable
            key={method.id}
            onPress={() => onChange(method.id)}
            style={[styles.row, selected && styles.selected]}
          >
            <View style={[styles.radio, selected && styles.radioOn]} />
            <View>
              <Text style={styles.title}>{method.title}</Text>
              {method.subtitle ? <Text style={styles.sub}>{method.subtitle}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.infoBg },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  radioOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.warning, marginTop: 2 },
});
