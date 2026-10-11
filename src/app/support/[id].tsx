import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { findFaq } from '@/features/hubContent';
import { Screen, useTheme } from '@/ui';

export default function SupportTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const faq = findFaq(id ?? '');
  const { colors } = useTheme();

  if (!faq) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Тема не найдена.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: faq.title }} />
      <Text style={[styles.lead, { color: colors.textMuted }]}>{faq.lead}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{faq.body}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
