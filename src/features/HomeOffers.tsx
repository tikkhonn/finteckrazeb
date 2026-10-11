import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, spacing, useTheme } from '@/ui';

import { BANK_OFFERS } from './homeContent';

export function HomeOffers() {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Предложения</Text>
      <View style={styles.grid}>
        {BANK_OFFERS.map((offer) => (
          <Pressable
            key={offer.id}
            style={styles.cell}
            onPress={() => router.push(`/info/${offer.id}`)}
          >
            <Card variant="elevated" style={styles.card}>
              <Text style={[styles.kicker, { color: colors.primary }]}>{offer.kicker}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{offer.title}</Text>
              <Text style={[styles.lead, { color: colors.textMuted }]} numberOfLines={2}>
                {offer.lead}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: '47%',
  },
  card: {
    minHeight: 92,
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: 4,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  lead: {
    fontSize: 12,
    lineHeight: 16,
  },
});
