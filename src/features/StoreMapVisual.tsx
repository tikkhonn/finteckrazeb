import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MAP_PINS, type MapPin, type StoreFeature } from '@/api/mock/stores';
import { radius, spacing, useTheme } from '@/ui';

interface StoreMapVisualProps {
  compact?: boolean;
  features?: StoreFeature[];
  selectedId?: string | null;
  onPress?: () => void;
  onPinPress?: (pin: MapPin) => void;
}

export function StoreMapVisual({
  compact = false,
  features,
  selectedId,
  onPress,
  onPinPress,
}: StoreMapVisualProps) {
  const { colors } = useTheme();
  const height = compact ? 140 : 320;
  const pins = features ? MAP_PINS.filter((pin) => features.includes(pin.feature)) : MAP_PINS;

  const pinVisual = (pin: MapPin) => (
    <>
      <View
        style={[
          styles.pin,
          {
            backgroundColor: pin.feature === 'Take & Go' ? colors.accent : colors.primary,
            borderColor: colors.onPrimary,
          },
          pin.id === selectedId ? styles.pinSelected : null,
        ]}
      />
      {compact ? null : (
        <View style={[styles.tooltip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pinName, { color: colors.text }]}>{pin.name}</Text>
          <Text style={[styles.pinMeta, { color: colors.textMuted }]}>{pin.feature}</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.board, { height }]}>
      <View style={[styles.road, styles.roadH]} />
      <View style={[styles.road, styles.roadH2]} />
      <View style={[styles.road, styles.roadV]} />
      <View style={[styles.block, { top: '12%', left: '10%' }]} />
      <View style={[styles.block, { top: '18%', right: '12%', width: 54 }]} />
      <View style={[styles.block, { bottom: '16%', left: '18%', width: 70 }]} />
      <View style={[styles.park, { top: '38%', right: '22%' }]} />

      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Карта магазинов"
          onPress={onPress}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {pins.map((pin) => {
        const pinStyle = [
          styles.pinWrap,
          {
            left: `${pin.x * 100}%` as `${number}%`,
            top: `${pin.y * 100}%` as `${number}%`,
          },
        ];
        if (!onPinPress) {
          return (
            <View key={pin.id} style={[pinStyle, styles.pinIdle]}>
              {pinVisual(pin)}
            </View>
          );
        }
        return (
          <Pressable
            key={pin.id}
            accessibilityRole="button"
            accessibilityLabel={pin.name}
            onPress={() => onPinPress(pin)}
            style={pinStyle}
          >
            {pinVisual(pin)}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#E4DCC8',
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#C9BFA8',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#F4EFE3',
  },
  roadH: {
    height: 14,
    left: 0,
    right: 0,
    top: '46%',
  },
  roadH2: {
    height: 10,
    left: 0,
    right: 0,
    top: '72%',
  },
  roadV: {
    width: 12,
    top: 0,
    bottom: 0,
    left: '42%',
  },
  block: {
    position: 'absolute',
    width: 48,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(92, 74, 48, 0.22)',
  },
  park: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(62, 122, 62, 0.35)',
  },
  pinWrap: {
    position: 'absolute',
    marginLeft: -8,
    marginTop: -8,
    alignItems: 'center',
  },
  pinIdle: {
    pointerEvents: 'none',
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  pinSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: -3,
    marginTop: -3,
  },
  tooltip: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 96,
  },
  pinName: {
    fontSize: 11,
    fontWeight: '700',
  },
  pinMeta: {
    fontSize: 10,
  },
});
