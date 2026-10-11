import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fullName } from '@/domain/profile';
import { promptBiometrics } from '@/features/authenticatePayment';
import { HubIcon } from '@/features/HubIcon';
import { HubGroup, HubRow, HubSection } from '@/features/HubRow';
import { HubToggle } from '@/features/HubToggle';
import { HUB_GLYPHS } from '@/features/hubIcons';
import { ProfileAvatar } from '@/features/ProfileAvatar';
import { SwitchAccountSheet } from '@/features/SwitchAccountSheet';
import { usePrefsStore } from '@/store/prefsStore';
import { useActiveProfile, useProfileStore } from '@/store/profileStore';
import { AnimatedEnter, Button, Screen, radius, spacing, useTheme } from '@/ui';

const SERVICES = [
  { title: 'Карты и счета', glyph: HUB_GLYPHS.cards, href: '/accounts' },
  { title: 'Лимиты', glyph: HUB_GLYPHS.limits, href: '/limits' },
  { title: 'Справки', glyph: HUB_GLYPHS.certs, href: '/certificates' },
  { title: 'Поддержка', glyph: HUB_GLYPHS.support, href: '/support' },
] as const;

export default function SettingsScreen() {
  const profile = useActiveProfile();
  const setAvatar = useProfileStore((s) => s.setAvatar);
  const switchProfile = useProfileStore((s) => s.switchProfile);
  const faceIdEnabled = usePrefsStore((s) => s.faceIdEnabled);
  const hideBalances = usePrefsStore((s) => s.hideBalances);
  const setFaceIdEnabled = usePrefsStore((s) => s.setFaceIdEnabled);
  const setHideBalances = usePrefsStore((s) => s.setHideBalances);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const { colors } = useTheme();

  async function toggleFaceId(next: boolean) {
    if (next) {
      const ok = await promptBiometrics('Включите Face ID для оплаты');
      if (!ok) {
        return;
      }
    }
    setFaceIdEnabled(next);
  }

  return (
    <Screen background="sky" edges={['top']} tabInset>
      <AnimatedEnter index={0}>
        <View style={styles.hero}>
          <ProfileAvatar profile={profile} onPicked={setAvatar} ring />
          <Text style={[styles.name, { color: colors.text }]}>{fullName(profile)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Мои данные"
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [styles.dataRow, pressed && styles.pressed]}
          >
            <Text style={[styles.dataLink, { color: colors.textMuted }]}>Мои данные</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        </View>
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        <View style={styles.tiles}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan & Go"
            onPress={() => router.navigate('/scan-and-go')}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.surface },
              pressed && styles.pressed,
            ]}
          >
            <HubIcon {...HUB_GLYPHS.scan} />
            <Text style={[styles.tileTitle, { color: colors.text }]}>Scan & Go</Text>
            <Text style={[styles.tileLead, { color: colors.textMuted }]}>Оплата без кассы</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Карта ВТБ"
            onPress={() => router.push('/offers/card')}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.surface },
              pressed && styles.pressed,
            ]}
          >
            <HubIcon {...HUB_GLYPHS.offer} />
            <Text style={[styles.tileTitle, { color: colors.text }]}>Карта ВТБ</Text>
            <Text style={[styles.tileLead, { color: colors.textMuted }]}>Кешбэк и оформление</Text>
          </Pressable>
        </View>
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <HubGroup>
          {SERVICES.map((item, index) => (
            <HubRow
              key={item.href}
              title={item.title}
              glyph={item.glyph}
              divider={index < SERVICES.length - 1}
              onPress={() => router.push(item.href)}
            />
          ))}
        </HubGroup>
      </AnimatedEnter>

      <AnimatedEnter index={3}>
        <HubSection title="Настройки" />
        <HubGroup>
          <HubToggle
            title="Face ID для оплаты"
            subtitle="Подтверждение корзины"
            glyph={HUB_GLYPHS.faceId}
            value={faceIdEnabled}
            onValueChange={(value) => void toggleFaceId(value)}
            divider
          />
          <HubToggle
            title="Скрывать балансы"
            subtitle="Точки на карте. Или переверните телефон"
            glyph={HUB_GLYPHS.hide}
            value={hideBalances}
            onValueChange={setHideBalances}
            divider
          />
          <HubRow
            title="Все настройки"
            subtitle="Тема, код, проверка операций"
            glyph={HUB_GLYPHS.settings}
            divider
            onPress={() => router.push('/prefs')}
          />
          <HubRow
            title="О приложении"
            glyph={HUB_GLYPHS.about}
            onPress={() => router.push('/about')}
          />
        </HubGroup>
      </AnimatedEnter>

      <AnimatedEnter index={4}>
        <Button title="Сменить аккаунт" variant="ghost" onPress={() => setAccountsOpen(true)} />
      </AnimatedEnter>

      <SwitchAccountSheet
        visible={accountsOpen}
        activeId={profile.id}
        onClose={() => setAccountsOpen(false)}
        onSelect={switchProfile}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataLink: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  pressed: { opacity: 0.72 },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: radius.xxl,
    padding: spacing.md,
    minHeight: 118,
    gap: 6,
    justifyContent: 'space-between',
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  tileLead: {
    fontSize: 12,
    lineHeight: 16,
  },
});
