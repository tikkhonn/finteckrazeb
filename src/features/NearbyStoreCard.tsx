import { StyleSheet, Text, View } from 'react-native';

import { formatDistance } from '@/api/mock/stores';
import type { Store } from '@/domain/types';
import { Button, Card, radius, spacing, useTheme } from '@/ui';

interface NearbyStoreCardProps {
  store: Store;
  selected?: boolean;
  onStart: () => void;
}

export function NearbyStoreCard({ store, selected, onStart }: NearbyStoreCardProps) {
  const { colors } = useTheme();
  return (
    <Card
      variant="elevated"
      style={selected ? { borderWidth: 2, borderColor: colors.primary, borderRadius: radius.xl } : undefined}
    >
      <View style={styles.head}>
        <Text style={[styles.name, { color: colors.text }]}>{store.name}</Text>
        <Text style={[styles.distance, { color: colors.textMuted }]}>{formatDistance(store.distanceM)}</Text>
      </View>
      <Text style={[styles.address, { color: colors.textMuted }]}>{store.address}</Text>
      <Text style={[styles.meta, { color: colors.success }]}>Доступен Scan & Go</Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>
        На входе отсканируйте QR магазина, чтобы начать покупку.
      </Text>
      <Button title="Начать покупку" variant="secondary" onPress={onStart} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: { flex: 1, fontSize: 16, fontWeight: '700' },
  distance: { fontSize: 13, fontWeight: '600' },
  address: { fontSize: 14 },
  meta: { fontWeight: '600' },
  note: { fontSize: 13, lineHeight: 18 },
});
