import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDistance } from '@/api/mock/stores';
import { radius, spacing, useTheme } from '@/ui';

import { routeTarget, shortName, visiblePins, type StoreMapProps } from './storeMapModel';

export function StoreMap({ compact = false, features, selectedId, onPinPress }: StoreMapProps) {
  const { colors } = useTheme();
  const pins = visiblePins(features);
  const target = routeTarget(pins, selectedId, compact);
  const shown = compact ? pins.slice(0, 3) : pins;

  return (
    <View style={[styles.board, { backgroundColor: colors.surface }]}>
      <Text style={[styles.note, { color: colors.textMuted }]}>Интерактивная карта доступна в приложении</Text>
      {shown.map((pin) => {
        const active = pin.id === target?.id;
        const tint = pin.feature === 'Take & Go' ? colors.accent : colors.primary;
        return (
          <Pressable
            key={pin.id}
            disabled={!onPinPress}
            onPress={() => onPinPress?.(pin)}
            style={[styles.row, { borderColor: active ? tint : colors.border }]}
          >
            <View style={[styles.dot, { backgroundColor: tint }]} />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {shortName(pin.name)}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{formatDistance(pin.distanceM)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { padding: spacing.md, gap: spacing.sm },
  note: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 12, fontWeight: '600' },
});
