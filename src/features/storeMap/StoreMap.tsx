import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { regionFor, USER_LOCATION, walkingRoute, type LatLng } from '@/api/mock/mapGeo';
import { formatDistance, type MapPin } from '@/api/mock/stores';
import { radius, spacing, useTheme } from '@/ui';

import { routeTarget, shortName, visiblePins, type StoreMapProps } from './storeMapModel';

const MARKER_HEIGHT = 38;
const EDGE_PADDING = { top: 72, right: 56, bottom: 72, left: 56 };

export function StoreMap({ compact = false, features, selectedId, onPinPress }: StoreMapProps) {
  const { colors, scheme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const pins = useMemo(() => visiblePins(features), [features]);
  const target = routeTarget(pins, selectedId, compact);
  const route = target ? walkingRoute(target.id) : null;

  const initialRegion = useMemo(
    () => regionFor([USER_LOCATION, ...(route ?? pins.map((pin) => pin.coordinate))], compact ? 1.35 : 1.25),
    // Стартовый кадр считаем один раз — дальше камерой управляет fitToCoordinates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!ready || compact) {
      return;
    }
    const focus: LatLng[] = route ?? pins.map((pin) => pin.coordinate);
    mapRef.current?.fitToCoordinates([USER_LOCATION, ...focus], {
      edgePadding: EDGE_PADDING,
      animated: true,
    });
  }, [ready, compact, route, pins]);

  return (
    <View style={{ height: compact ? 168 : 400 }} pointerEvents={compact ? 'none' : 'auto'}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onMapReady={() => setReady(true)}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        userInterfaceStyle={scheme === 'dark' ? 'dark' : 'light'}
        showsPointsOfInterests={false}
        showsCompass={!compact}
        showsScale={!compact}
        toolbarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={!compact}
        scrollEnabled={!compact}
        zoomEnabled={!compact}
      >
        {route ? (
          <>
            <Polyline coordinates={route} strokeColor="#FFFFFF" strokeWidth={8} lineCap="round" lineJoin="round" />
            <Polyline
              coordinates={route}
              strokeColor={colors.primary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          </>
        ) : null}

        <Marker coordinate={USER_LOCATION} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false} zIndex={1}>
          <View style={[styles.youHalo, { backgroundColor: `${colors.primary}33` }]}>
            <View style={[styles.youDot, { backgroundColor: colors.primary }]} />
          </View>
        </Marker>

        {pins.map((pin) => {
          const active = pin.id === target?.id;
          return (
            <Marker
              // Смена ключа перерисовывает маркер при выборе: tracksViewChanges выключен ради производительности.
              key={`${pin.id}-${active ? 'on' : 'off'}`}
              coordinate={pin.coordinate}
              anchor={{ x: 0.5, y: 1 }}
              centerOffset={{ x: 0, y: -MARKER_HEIGHT / 2 }}
              tracksViewChanges={false}
              zIndex={active ? 3 : 2}
              onPress={() => {
                if (!onPinPress) {
                  return;
                }
                void Haptics.selectionAsync();
                onPinPress(pin);
              }}
            >
              <StoreMarker pin={pin} active={active} compact={compact} />
            </Marker>
          );
        })}
      </MapView>

      {compact ? (
        <View style={[styles.peek, { backgroundColor: colors.surface }]}>
          <Text style={[styles.peekText, { color: colors.text }]}>Открыть карту</Text>
        </View>
      ) : (
        <View style={[styles.legend, { backgroundColor: colors.surface }]} pointerEvents="none">
          <LegendDot color={colors.primary} label="Scan & Go" fg={colors.text} />
          <LegendDot color={colors.accent} label="Take & Go" fg={colors.text} />
        </View>
      )}
    </View>
  );
}

function StoreMarker({ pin, active, compact }: { pin: MapPin; active: boolean; compact: boolean }) {
  const { colors } = useTheme();
  const tint = pin.feature === 'Take & Go' ? colors.accent : colors.primary;
  return (
    <View style={styles.marker}>
      <View
        style={[
          styles.bubble,
          compact ? styles.bubbleCompact : null,
          { backgroundColor: active ? tint : colors.surface, borderColor: tint },
        ]}
      >
        <View style={[styles.bubbleDot, { backgroundColor: active ? '#FFFFFF' : tint }]} />
        {compact ? null : (
          <Text numberOfLines={1} style={[styles.bubbleText, { color: active ? '#FFFFFF' : colors.text }]}>
            {shortName(pin.name)} · {formatDistance(pin.distanceM)}
          </Text>
        )}
      </View>
      <View style={[styles.tail, { borderTopColor: tint }]} />
    </View>
  );
}

function LegendDot({ color, label, fg }: { color: string; label: string; fg: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    height: MARKER_HEIGHT,
    alignItems: 'center',
  },
  bubble: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bubbleCompact: {
    width: 30,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  bubbleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 170,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  youHalo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  peek: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  peekText: {
    fontSize: 12,
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
