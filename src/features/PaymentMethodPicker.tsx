import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PaymentMethod } from '@/domain/types';
import { useActiveProfile } from '@/store/profileStore';
import { radius, spacing, useTheme } from '@/ui';

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  const { colors } = useTheme();
  const last4 = useActiveProfile().cardLast4;
  const methods: { id: PaymentMethod; title: string; subtitle?: string }[] = [
    { id: 'card', title: `Карта ВТБ •• ${last4}` },
    { id: 'sbp', title: 'СБП' },
    { id: 'digital_ruble', title: 'Цифровой рубль', subtitle: 'Демонстрационный режим' },
  ];

  return (
    <View style={styles.list}>
      {methods.map((method) => {
        const selected = method.id === value;
        return (
          <Pressable
            key={method.id}
            onPress={() => onChange(method.id)}
            style={[
              styles.row,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.infoBg : colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? colors.primary : colors.textMuted,
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            />
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{method.title}</Text>
              {method.subtitle ? (
                <Text style={[styles.sub, { color: colors.warning }]}>{method.subtitle}</Text>
              ) : null}
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
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  title: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
});
