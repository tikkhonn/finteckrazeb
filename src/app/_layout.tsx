import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { getMockApi, isMockApi } from '@/api/apiProvider';
import { queryClient } from '@/queries/client';
import { colors } from '@/ui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(!isMockApi);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (isMockApi) {
        await getMockApi()?.hydrate();
      }
      if (!cancelled) {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ВТБ Go' }} />
        <Stack.Screen name="scan-store" options={{ title: 'QR магазина' }} />
        <Stack.Screen name="session/[id]/cart" options={{ title: 'Корзина' }} />
        <Stack.Screen name="session/[id]/scan-item" options={{ title: 'Сканировать товар' }} />
        <Stack.Screen name="session/[id]/checkout" options={{ title: 'Оплата' }} />
        <Stack.Screen name="session/[id]/payment-status" options={{ title: 'Статус оплаты', headerBackVisible: false }} />
        <Stack.Screen name="session/[id]/done" options={{ title: 'Покупка', headerBackVisible: false }} />
        <Stack.Screen name="history/index" options={{ title: 'Мои покупки' }} />
        <Stack.Screen name="history/[id]/index" options={{ title: 'Покупка' }} />
        <Stack.Screen name="history/[id]/refund" options={{ title: 'Возврат' }} />
        <Stack.Screen name="help" options={{ title: 'Помощь' }} />
        <Stack.Screen name="demo-panel" options={{ title: 'Демо-панель', presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
