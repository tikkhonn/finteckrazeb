import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CashOperationSuccessHeader } from '@/features/CashOperationSuccessHeader';
import { CashOperationTicket } from '@/features/CashOperationTicket';
import { SuccessCheckBadge } from '@/features/SuccessCheckBadge';
import { formatRub } from '@/domain/money';
import { useProfileStore } from '@/store/profileStore';
import { AnimatedEnter, Button, Screen, spacing, useTheme } from '@/ui';

export default function CashOpScreen() {
  const { colors, typography } = useTheme();
  const { id, celebrate } = useLocalSearchParams<{ id: string; celebrate?: string }>();
  const activeId = useProfileStore((s) => s.activeId);
  const cashOpsById = useProfileStore((s) => s.cashOpsById);
  const op = (cashOpsById[activeId] ?? []).find((item) => item.id === id);
  const justCompleted = celebrate === '1';

  if (!op) {
    return (
      <Screen background="sky">
        <Text style={{ color: colors.textMuted }}>Операция не найдена</Text>
      </Screen>
    );
  }

  const credit = op.kind === 'topup';

  if (justCompleted) {
    return (
      <>
        <Stack.Screen
          options={{
            title: credit ? 'Пополнение' : 'Снятие',
            headerBackVisible: false,
            headerLeft: () => null,
          }}
        />
        <Screen background="sky" edges={['bottom']}>
          <AnimatedEnter index={0}>
            <CashOperationSuccessHeader kind={op.kind} amount={op.amount} at={op.at} />
          </AnimatedEnter>
          <AnimatedEnter index={1}>
            <CashOperationTicket op={op} />
          </AnimatedEnter>
          <AnimatedEnter index={2}>
            <View style={styles.actions}>
              <Button title="К карте" onPress={() => router.replace('/account')} />
              <Button title="Проблема с операцией" variant="ghost" onPress={() => router.push('/help')} />
            </View>
          </AnimatedEnter>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: credit ? 'Пополнение' : 'Снятие' }} />
      <Screen background="sky" edges={['bottom']}>
        <AnimatedEnter index={0}>
          <View style={styles.detailHero}>
            <SuccessCheckBadge animate={false} size="md" />
            <Text style={[typography.title, { color: colors.text, textAlign: 'center' }]}>
              {credit ? 'Пополнение по QR' : 'Снятие по QR'}
            </Text>
            <Text style={[styles.detailAmount, { color: credit ? colors.success : colors.text }]}>
              {credit ? '+' : '−'}
              {formatRub(op.amount)}
            </Text>
          </View>
        </AnimatedEnter>
        <AnimatedEnter index={1}>
          <CashOperationTicket op={op} />
        </AnimatedEnter>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  detailHero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  detailAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
});
