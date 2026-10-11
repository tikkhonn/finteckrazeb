import { Alert, StyleSheet, Text } from 'react-native';

import { promptBiometrics } from '@/features/authenticatePayment';
import { HubGroup, HubRow, HubSection } from '@/features/HubRow';
import { HubToggle } from '@/features/HubToggle';
import { HUB_GLYPHS } from '@/features/hubIcons';
import { ThemePicker } from '@/features/ThemePicker';
import { usePrefsStore } from '@/store/prefsStore';
import { Screen, spacing, useTheme } from '@/ui';

export default function PrefsScreen() {
  const { colors } = useTheme();
  const faceIdEnabled = usePrefsStore((s) => s.faceIdEnabled);
  const hideBalances = usePrefsStore((s) => s.hideBalances);
  const setFaceIdEnabled = usePrefsStore((s) => s.setFaceIdEnabled);
  const setHideBalances = usePrefsStore((s) => s.setHideBalances);

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
    <Screen>
      <HubSection title="Безопасность" />
      <HubGroup>
        <HubToggle
          title="Face ID для оплаты"
          subtitle="Если выключено, корзина подтверждается без биометрии"
          glyph={HUB_GLYPHS.faceId}
          value={faceIdEnabled}
          onValueChange={(value) => void toggleFaceId(value)}
          divider
        />
        <HubRow
          title="Сменить код"
          subtitle="Код входа в приложение"
          glyph={HUB_GLYPHS.pin}
          divider
          onPress={() =>
            Alert.alert('Смена кода', 'В демо код не задаётся. Этот пункт показывает сценарий банка.')
          }
        />
        <HubRow
          title="Проверка операций"
          subtitle="Подтверждение подозрительных списаний"
          glyph={HUB_GLYPHS.ops}
          onPress={() =>
            Alert.alert(
              'Проверка операций',
              'В демо подозрительных операций нет. В банке сюда приходят пуши на подтверждение.',
            )
          }
        />
      </HubGroup>

      <HubSection title="Конфиденциальность" />
      <HubGroup>
        <HubToggle
          title="Скрывать балансы"
          subtitle="На карте и в счёте вместо суммы будут точки. Нажмите на сумму, чтобы показать. Или переверните телефон экраном вниз и обратно"
          glyph={HUB_GLYPHS.hide}
          value={hideBalances}
          onValueChange={setHideBalances}
        />
      </HubGroup>

      <HubSection title="Оформление" />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Тема приложения. «Как в системе» следует за светлой или тёмной темой телефона.
      </Text>
      <ThemePicker />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
