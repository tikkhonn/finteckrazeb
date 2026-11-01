import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { findStoreById, formatDistance, nearestStores, type MapPin } from '@/api/mock/stores';
import { NearbyStoreCard } from '@/features/NearbyStoreCard';
import { StoreMap } from '@/features/storeMap/StoreMap';
import { AnimatedEnter, Button, Card, Screen, spacing, useTheme } from '@/ui';

const NEARBY = nearestStores(3);
const NEARBY_IDS = new Set(NEARBY.map((store) => store.id));

function openStoreQr(storeId: string) {
  router.push({ pathname: '/scan-store', params: { storeId } });
}

export default function StoresMapScreen() {
  const { colors, typography } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remotePin, setRemotePin] = useState<MapPin | null>(null);

  const remoteStore = useMemo(
    () => (remotePin?.feature === 'Scan & Go' ? findStoreById(remotePin.id) : undefined),
    [remotePin],
  );

  function onPinPress(pin: MapPin) {
    if (pin.feature === 'Take & Go') {
      setRemotePin(pin);
      setSelectedId(null);
      return;
    }
    if (NEARBY_IDS.has(pin.id)) {
      setSelectedId(pin.id);
      setRemotePin(null);
      return;
    }
    setRemotePin(pin);
    setSelectedId(null);
  }

  return (
    <Screen background="sky" edges={['bottom']}>
      <AnimatedEnter index={0}>
        <Text style={typography.h2}>Магазины рядом</Text>
        <Text style={[styles.lead, { color: colors.textMuted }]}>
          Точки Scan & Go в центре — выберите пин, чтобы начать покупку
        </Text>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <Card variant="elevated" style={styles.mapCard}>
          <StoreMap selectedId={selectedId ?? remotePin?.id} onPinPress={onPinPress} />
        </Card>
      </AnimatedEnter>

      {remotePin?.feature === 'Take & Go' ? (
        <AnimatedEnter index={2}>
          <Card variant="elevated">
            <Text style={[styles.store, { color: colors.text }]}>{remotePin.name}</Text>
            <Text style={[styles.meta, { color: colors.success }]}>
              {remotePin.feature} · {formatDistance(remotePin.distanceM)}
            </Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>{remotePin.address}</Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>Take & Go скоро появится в приложении.</Text>
          </Card>
        </AnimatedEnter>
      ) : null}

      {remoteStore ? (
        <AnimatedEnter index={2}>
          <Card variant="elevated">
            <Text style={[styles.store, { color: colors.text }]}>{remoteStore.name}</Text>
            <Text style={[styles.meta, { color: colors.success }]}>
              Scan & Go · {formatDistance(remoteStore.distanceM)}
            </Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>{remoteStore.address}</Text>
            <Button
              title="Начать покупку"
              variant="secondary"
              onPress={() => openStoreQr(remoteStore.id)}
            />
          </Card>
        </AnimatedEnter>
      ) : null}

      <AnimatedEnter index={3}>
        <View style={styles.nearbySection}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Рядом с вами</Text>
          {NEARBY.map((store) => (
            <NearbyStoreCard
              key={store.id}
              store={store}
              selected={store.id === selectedId}
              onStart={() => openStoreQr(store.id)}
            />
          ))}
        </View>
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 15, fontWeight: '400' },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  nearbySection: {
    width: '100%',
    gap: spacing.md,
  },
  store: { fontSize: 18, fontWeight: '700' },
  meta: { fontWeight: '600' },
  note: { fontSize: 13 },
});
