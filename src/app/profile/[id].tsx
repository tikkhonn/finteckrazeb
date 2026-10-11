import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { resolveProfileItem } from '@/domain/profile';
import { useActiveProfile } from '@/store/profileStore';
import { Card, Screen, useTheme } from '@/ui';

export default function ProfileItemScreen() {
  const { colors, typography } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useActiveProfile();
  const item = typeof id === 'string' ? resolveProfileItem(profile, id) : null;

  if (!item) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Данные' }} />
        <Text style={typography.body}>Запись не найдена</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: item.title }} />
      <Card variant="elevated">
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{item.title}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
        {item.caption ? <Text style={[styles.caption, { color: colors.textMuted }]}>{item.caption}</Text> : null}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Просмотр. В демо эти данные нельзя изменить.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  caption: { fontSize: 14, lineHeight: 20 },
  note: { fontSize: 13, lineHeight: 18 },
});
