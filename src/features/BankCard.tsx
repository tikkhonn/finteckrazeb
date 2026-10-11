import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileId, ResolvedProfile } from '@/domain/profile';
import { MaskedAmount } from '@/features/MaskedAmount';
import { colors, radius, spacing, textOutline, useTheme } from '@/ui';

export const CARD_ART: Record<ProfileId, ImageSource> = {
  anna: require('../../assets/images/card-anna.png'),
  dmitry: require('../../assets/images/card-dmitry.png'),
  maria: require('../../assets/images/card-maria.png'),
};

type Props = {
  profile: ResolvedProfile;
  onPress?: () => void;
};

export function BankCardFace({
  profile,
  peekAmount = true,
}: {
  profile: ResolvedProfile;
  peekAmount?: boolean;
}) {
  const { shadow } = useTheme();
  return (
    <View style={[styles.card, shadow.card]}>
      <Image source={CARD_ART[profile.id]} style={styles.art} contentFit="cover" />
      <LinearGradient
        colors={['rgba(11,31,58,0.35)', 'transparent', 'rgba(11,31,58,0.45)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.top}>
        <Text style={styles.meta}>
          {profile.cardNetwork} · •• {profile.cardLast4}
        </Text>
        <MaskedAmount value={profile.balance} style={styles.balance} interactive={peekAmount} />
      </View>
      <Text style={styles.account} numberOfLines={1}>
        {profile.accountName}
      </Text>
    </View>
  );
}

export function BankCard({ profile, onPress }: Props) {
  const face = <BankCardFace profile={profile} peekAmount={!onPress} />;
  if (!onPress) {
    return face;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={profile.accountName}
      onPress={onPress}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {face}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  card: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  art: {
    ...StyleSheet.absoluteFill,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  meta: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    ...textOutline(2),
  },
  balance: {
    color: colors.onPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    ...textOutline(3),
  },
  account: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    ...textOutline(2),
  },
});
