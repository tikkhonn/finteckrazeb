import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isMockApi } from '@/api/apiProvider';
import { DEMO_STORE } from '@/api/mock/stores';
import { useStartSession } from '@/queries/hooks';
import { useUiStore } from '@/store/uiStore';
import { Button, Card, Screen, colors, spacing, typography } from '@/ui';

export default function HomeScreen() {
  const start = useStartSession();
  const setActiveSession = useUiStore((s) => s.setActiveSession);

  async function openStore(storeId: string) {
    const session = await start.mutateAsync(storeId);
    setActiveSession(session.id);
    router.push(`/session/${session.id}/cart`);
  }

  return (
    <Screen>
      <Pressable
        onLongPress={() => {
          if (isMockApi) {
            router.push('/demo-panel');
          }
        }}
        delayLongPress={500}
      >
        <Text style={typography.title}>ВТБ Go</Text>
      </Pressable>
      <Text style={typography.h2}>Покупки без очереди</Text>
      <Text style={styles.lead}>
        Сканируйте товары и оплачивайте в приложении банка
      </Text>

      <Button title="Сканировать QR магазина" onPress={() => router.push('/scan-store')} />

      <Card>
        <Text style={styles.section}>Рядом с вами</Text>
        <Text style={styles.store}>{DEMO_STORE.name}</Text>
        <Text style={styles.meta}>Доступен Scan & Go</Text>
        <Text style={styles.note}>
          Геолокация — ориентир. Для начала покупки лучше подтвердить точку QR на входе.
        </Text>
        <Button
          title="Начать покупку"
          variant="secondary"
          loading={start.isPending}
          onPress={() => void openStore(DEMO_STORE.id)}
        />
      </Card>

      <View style={{ gap: spacing.sm }}>
        <Text style={styles.section}>Мои покупки</Text>
        <Button
          title="Чеки и запросы на возврат"
          variant="ghost"
          onPress={() => router.push('/history')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.textMuted },
  section: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  store: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { color: colors.success, fontWeight: '600' },
  note: { fontSize: 13, color: colors.textMuted },
});
