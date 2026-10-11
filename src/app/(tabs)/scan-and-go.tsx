import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isMockApi } from '@/api/apiProvider';
import { formatDistance, nearestStores } from '@/api/mock/stores';
import { RecentPurchases } from '@/features/RecentPurchases';
import { ScanGoHero } from '@/features/ScanGoHero';
import { StoreMapVisual } from '@/features/StoreMapVisual';
import { AnimatedEnter, Card, Chip, Screen, spacing, useTheme } from '@/ui';

const NEAREST = nearestStores(1)[0];

function openStoreQr() {
  router.push('/scan-store');
}

export default function ScanAndGoScreen() {
  const { colors, typography } = useTheme();

  return (
    <Screen background="sky" edges={['top']} tabInset>
      <AnimatedEnter index={0}>
        <Pressable
          style={styles.header}
          onLongPress={() => {
            if (isMockApi) {
              router.push('/demo-panel');
            }
          }}
          delayLongPress={500}
        >
          <Text style={[styles.hello, { color: colors.textMuted }]}>Оплата в магазине</Text>
          <Text style={typography.title}>Scan & Go</Text>
        </Pressable>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <ScanGoHero onPress={openStoreQr} />
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Магазины на карте"
          onPress={() => router.push('/stores-map')}
          style={({ pressed }) => [styles.full, pressed && styles.pressed]}
        >
          <Card variant="elevated">
            <View style={styles.mapHead}>
              <View style={styles.mapCopy}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Магазины рядом</Text>
                {NEAREST ? (
                  <Text style={[styles.mapTitle, { color: colors.text }]}>
                    {NEAREST.name} · {formatDistance(NEAREST.distanceM)}
                  </Text>
                ) : null}
              </View>
              <Chip label="Карта" />
            </View>
            <StoreMapVisual compact features={['Scan & Go']} />
          </Card>
        </Pressable>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
        <View style={styles.purchases}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Мои покупки</Text>
          <RecentPurchases />
        </View>
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  hello: { fontSize: 12, fontWeight: '400' },
  sectionLabel: { fontSize: 13, fontWeight: '600' },
  mapHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  mapCopy: {
    flex: 1,
    gap: 2,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  purchases: {
    width: '100%',
    gap: spacing.sm,
  },
  full: { width: '100%' },
  pressed: { opacity: 0.92 },
});
