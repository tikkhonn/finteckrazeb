import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CartItem } from '@/domain/types';
import { formatRub } from '@/domain/money';
import { colors, radius, spacing } from '@/ui';

interface CartItemRowProps {
  item: CartItem;
  editable?: boolean;
  onInc?: () => void;
  onDec?: () => void;
}

export function CartItemRow({ item, editable, onInc, onDec }: CartItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.qty} шт. · {formatRub(item.unitPrice)}
          {item.addedBy === 'cashier' ? ' · добавил кассир' : ''}
        </Text>
      </View>
      <Text style={styles.price}>{formatRub(item.unitPrice * item.qty)}</Text>
      {editable ? (
        <View style={styles.stepper}>
          <Pressable onPress={onDec} style={styles.step}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.qty}</Text>
          <Pressable onPress={onInc} style={styles.step}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  info: { gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  price: { fontSize: 16, fontWeight: '700', color: colors.text, position: 'absolute', right: 0, top: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  step: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  qty: { minWidth: 20, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
});
