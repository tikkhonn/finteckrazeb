import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ReduceMotion } from 'react-native-reanimated';

import { formatWeightLine, lineAmount } from '@/domain/cart';
import { formatRub } from '@/domain/money';
import type { CartItem } from '@/domain/types';
import { radius, spacing, useTheme } from '@/ui';

interface CartItemRowProps {
  item: CartItem;
  index?: number;
  editable?: boolean;
  onInc?: () => void;
  onDec?: () => void;
}

export function CartItemRow({ item, index = 0, editable, onInc, onDec }: CartItemRowProps) {
  const { colors } = useTheme();
  const weighted = item.weightKg != null;
  const excise = (item.exciseCodes ?? []).length > 0;
  const weightLine = formatWeightLine(item);
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)
        .duration(350)
        .reduceMotion(ReduceMotion.System)}
      layout={LinearTransition.springify().reduceMotion(ReduceMotion.System)}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {weightLine ?? `${item.qty} шт. · ${formatRub(item.unitPrice)}`}
          {item.addedBy === 'cashier' ? ' · добавил кассир' : ''}
        </Text>
        {excise ? (
          <Text style={[styles.badge, { color: colors.success, backgroundColor: colors.successBg }]}>Акциз проверен</Text>
        ) : null}
        {item.isAdultOnly ? (
          <Text style={[styles.badge, { color: colors.success, backgroundColor: colors.successBg }]}>
            18+ подтверждено по паспорту ВТБ
          </Text>
        ) : null}
      </View>
      <Text style={[styles.price, { color: colors.text }]}>{formatRub(lineAmount(item))}</Text>
      {editable && weighted ? (
        <View style={styles.weightActions}>
          <Pressable onPress={onDec} style={[styles.wide, { backgroundColor: colors.chip }]}>
            <Text style={[styles.wideText, { color: colors.primary }]}>Удалить пакет</Text>
          </Pressable>
          <Pressable onPress={onInc} style={[styles.wide, { backgroundColor: colors.chip }]}>
            <Text style={[styles.wideText, { color: colors.primary }]}>Взвесить ещё</Text>
          </Pressable>
        </View>
      ) : editable ? (
        <View style={styles.stepper}>
          <Pressable onPress={onDec} style={[styles.step, { backgroundColor: colors.chip }]}>
            <Text style={[styles.stepText, { color: colors.primary }]}>−</Text>
          </Pressable>
          <Text style={[styles.qty, { color: colors.text }]}>{item.qty}</Text>
          <Pressable onPress={onInc} style={[styles.step, { backgroundColor: colors.chip }]}>
            <Text style={[styles.stepText, { color: colors.primary }]}>+</Text>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: { gap: 4, paddingRight: 96 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13 },
  badge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  weightActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  wide: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  wideText: { fontSize: 13, fontWeight: '700' },
  price: { fontSize: 16, fontWeight: '700', position: 'absolute', right: 0, top: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  step: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 18, fontWeight: '600' },
  qty: { minWidth: 20, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
