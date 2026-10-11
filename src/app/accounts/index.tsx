import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CARD_ART } from '@/features/BankCard';
import { HUB_WALLETS } from '@/features/hubContent';
import { useActiveProfile } from '@/store/profileStore';
import { Screen, radius, spacing, useTheme } from '@/ui';

export default function AccountsScreen() {
  const profile = useActiveProfile();
  const { colors } = useTheme();
  const [banner, setBanner] = useState(true);

  return (
    <Screen>
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        Карта ВТБ работает в Scan & Go. Остальные банки и копилки — демо.
      </Text>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: colors.chip }]}>
          <Text style={[styles.bannerText, { color: colors.text }]}>
            Чужие карты не списываются. Чтобы пользоваться ими в магазине, нужен выпуск карты ВТБ.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Скрыть подсказку"
            onPress={() => setBanner(false)}
            hitSlop={8}
          >
            <Text style={[styles.dismiss, { color: colors.textMuted }]}>×</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Ваши карты</Text>
      <View style={styles.grid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${profile.accountName}, карта ВТБ`}
          onPress={() => router.push('/account')}
          style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
        >
          <View style={[styles.tile, { backgroundColor: colors.primary }]}>
            <Image source={CARD_ART[profile.id]} style={styles.art} contentFit="cover" />
            <View style={styles.tileBody}>
              <Text style={styles.tileBank}>ВТБ</Text>
              <Text style={styles.tileMeta}>•• {profile.cardLast4}</Text>
            </View>
          </View>
        </Pressable>
        {HUB_WALLETS.map((wallet) => (
          <Pressable
            key={wallet.id}
            accessibilityRole="button"
            accessibilityLabel={wallet.name}
            onPress={() => router.push(`/accounts/${wallet.id}`)}
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
          >
            <View style={[styles.tile, { backgroundColor: wallet.tint }]}>
              <Text style={styles.mark}>{wallet.mark}</Text>
              <View style={styles.tileBody}>
                <Text style={styles.tileBank}>{wallet.name}</Text>
                <Text style={styles.tileMeta}>•• {wallet.last4}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 15,
    lineHeight: 22,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismiss: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '500',
  },
  section: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.sm,
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
  tile: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    minHeight: 118,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  art: {
    ...StyleSheet.absoluteFill,
  },
  mark: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 22,
    fontWeight: '700',
  },
  tileBody: {
    gap: 2,
  },
  tileBank: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tileMeta: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
  },
  pressed: { opacity: 0.86 },
});
