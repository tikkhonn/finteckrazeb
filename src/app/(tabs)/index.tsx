import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BankCard } from '@/features/BankCard';
import { HomeOffers } from '@/features/HomeOffers';
import { HomeRibbon } from '@/features/HomeRibbon';
import { dayGreeting } from '@/features/homeContent';
import { useActiveProfile } from '@/store/profileStore';
import {
  AnimatedEnter,
  Card,
  Chip,
  Screen,
  useTheme,
} from '@/ui';

export default function HomeScreen() {
  const profile = useActiveProfile();
  const { colors, typography } = useTheme();

  return (
    <Screen background="sky" edges={['top']} tabInset>
      <AnimatedEnter index={0}>
        <Text style={[styles.hello, { color: colors.textMuted }]}>{dayGreeting()}</Text>
        <Text style={typography.title}>{profile.firstName}</Text>
      </AnimatedEnter>

      <HomeRibbon />

      <AnimatedEnter index={1}>
        <BankCard profile={profile} onPress={() => router.push('/account')} />
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <Pressable style={styles.full} onPress={() => router.push('/offers/card')}>
          <Card variant="featured">
            <Text style={styles.featuredKicker}>Дебетовая карта</Text>
            <Text style={styles.featuredTitle}>Карта ВТБ</Text>
            <Text style={styles.featuredLead}>Кешбэк в категориях и оплата без кассы</Text>
            <Chip label="Оформить" variant="onDark" />
          </Card>
        </Pressable>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
        <Pressable style={styles.full} onPress={() => router.push('/offers/cashback')}>
          <Card variant="elevated">
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Кешбэк</Text>
            <Text style={[styles.offerTitle, { color: colors.text }]}>До 15% в категориях месяца</Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>Театры, кино, аптеки, почта</Text>
          </Card>
        </Pressable>
      </AnimatedEnter>

      <AnimatedEnter index={4}>
        <HomeOffers />
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: 12, fontWeight: '400' },
  sectionLabel: { fontSize: 13, fontWeight: '600' },
  featuredKicker: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  featuredLead: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.9)' },
  offerTitle: { fontSize: 16, fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 16 },
  full: { width: '100%' },
});
