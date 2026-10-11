import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { HubIcon } from '@/features/HubIcon';
import { HUB_FAQS } from '@/features/hubContent';
import { FAQ_GLYPHS } from '@/features/hubIcons';
import { useActiveProfile } from '@/store/profileStore';
import { Button, Screen, radius, spacing, useTheme } from '@/ui';

export default function SupportScreen() {
  const profile = useActiveProfile();
  const { colors } = useTheme();

  return (
    <Screen
      footer={
        <Button
          title="Задать вопрос"
          onPress={() =>
            Alert.alert(
              'Вопрос принят',
              `Ответим на ${profile.email}. В демо сообщение не уходит в банк.`,
            )
          }
        />
      }
    >
      <Text style={[styles.lead, { color: colors.textMuted }]}>
        Короткие ответы по Scan & Go, карте и документам. Если темы нет — напишите вопрос.
      </Text>
      <View style={styles.grid}>
        {HUB_FAQS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => router.push(`/support/${item.id}`)}
            style={({ pressed }) => [
              styles.cell,
              { backgroundColor: colors.surface },
              pressed && styles.pressed,
            ]}
          >
            <HubIcon {...(FAQ_GLYPHS[item.id] ?? FAQ_GLYPHS.all)} />
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.leadSmall, { color: colors.textMuted }]} numberOfLines={2}>
              {item.lead}
            </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: '47%',
    minHeight: 124,
    borderRadius: radius.xxl,
    padding: spacing.md,
    gap: 4,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  leadSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: { opacity: 0.72 },
});
