import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HubGroup, HubRow } from '@/features/HubRow';
import { HUB_CERTIFICATES } from '@/features/hubContent';
import { useCertsStore } from '@/store/certsStore';
import { BottomSheet, Button, Screen, radius, spacing, useTheme } from '@/ui';

type Tab = 'all' | 'ordered';

export default function CertificatesScreen() {
  const { colors } = useTheme();
  const ordered = useCertsStore((s) => s.ordered);
  const [tab, setTab] = useState<Tab>('all');
  const [otherOpen, setOtherOpen] = useState(false);

  const orderedRows = useMemo(
    () =>
      ordered.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: new Date(item.at).toLocaleString('ru-RU'),
        href: `/certificates/${item.certId}` as const,
      })),
    [ordered],
  );

  return (
    <Screen
      footer={
        <Button title="Мне нужна другая" variant="secondary" onPress={() => setOtherOpen(true)} />
      }
    >
      <View style={[styles.track, { backgroundColor: colors.chip }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'all' }}
          onPress={() => setTab('all')}
          style={[styles.pill, tab === 'all' && { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.pillLabel, { color: tab === 'all' ? colors.text : colors.textMuted }]}>
            Все
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: tab === 'ordered' }}
          onPress={() => setTab('ordered')}
          style={[styles.pill, tab === 'ordered' && { backgroundColor: colors.surface }]}
        >
          <Text
            style={[styles.pillLabel, { color: tab === 'ordered' ? colors.text : colors.textMuted }]}
          >
            Заказанные
          </Text>
        </Pressable>
      </View>

      {tab === 'all' ? (
        <HubGroup>
          {HUB_CERTIFICATES.map((item, index) => (
            <HubRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              divider={index < HUB_CERTIFICATES.length - 1}
              onPress={() => router.push(`/certificates/${item.id}`)}
            />
          ))}
        </HubGroup>
      ) : orderedRows.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Пока ничего не заказывали. Выберите справку на вкладке «Все».
        </Text>
      ) : (
        <HubGroup>
          {orderedRows.map((item, index) => (
            <HubRow
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              divider={index < orderedRows.length - 1}
              onPress={() => router.push(item.href)}
            />
          ))}
        </HubGroup>
      )}

      <BottomSheet
        visible={otherOpen}
        title="Другая справка"
        onClose={() => setOtherOpen(false)}
      >
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          Напишите в чат поддержки, какая справка нужна. В демо заявка не уходит в банк — мы
          покажем подтверждение на экране.
        </Text>
        <Button
          title="Понятно"
          onPress={() => {
            setOtherOpen(false);
            router.push('/support');
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: spacing.md,
  },
});
