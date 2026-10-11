import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PurchaseSuccessHeader } from '@/features/PurchaseSuccessHeader';
import { ReceiptPendingCard } from '@/features/ReceiptPendingCard';
import { ReceiptView } from '@/features/ReceiptView';
import { usePurchase } from '@/queries/hooks';
import { AnimatedEnter, Button, Screen, spacing, useTheme } from '@/ui';

export default function DoneScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const purchaseQuery = usePurchase(id);
  const purchase = purchaseQuery.data;

  if (purchaseQuery.isLoading || !purchase) {
    return (
      <Screen background="sky">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.muted, { color: colors.textMuted }]}>Загружаем чек…</Text>
        </View>
      </Screen>
    );
  }

  const paidAt = purchase.receipt?.issuedAt ?? purchase.payment?.createdAt;

  return (
    <Screen background="sky" edges={['bottom']}>
      <AnimatedEnter index={0}>
        <PurchaseSuccessHeader
          total={purchase.session.cart.total}
          storeName={purchase.session.storeName}
          paidAt={paidAt}
        />
      </AnimatedEnter>

      <AnimatedEnter index={1}>
        {purchase.receipt ? (
          <ReceiptView receipt={purchase.receipt} storeName={purchase.session.storeName} />
        ) : (
          <ReceiptPendingCard storeName={purchase.session.storeName} total={purchase.session.cart.total} />
        )}
      </AnimatedEnter>

      <AnimatedEnter index={2}>
        <View style={styles.actions}>
          <Button title="На главную" onPress={() => router.replace('/')} />
          <Button
            title="Открыть в истории"
            variant="secondary"
            onPress={() => router.replace(`/history/${id}`)}
          />
          <Button title="Проблема с покупкой" variant="ghost" onPress={() => router.push('/help')} />
        </View>
      </AnimatedEnter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  muted: { fontSize: 15 },
  actions: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
