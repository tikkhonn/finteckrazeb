import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getMockApi, isMockApi } from '@/api/apiProvider';
import { AnimatedSplash } from '@/features/AnimatedSplash';
import { useFlipHideSensor } from '@/features/useFlipHideSensor';
import { queryClient } from '@/queries/client';
import { hydrateCerts } from '@/store/certsStore';
import { hydratePrefs } from '@/store/prefsStore';
import { hydrateProfile } from '@/store/profileStore';
import { hydrateTheme } from '@/store/themeStore';
import { BackButton, useTheme } from '@/ui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await Promise.all([hydrateProfile(), hydrateTheme(), hydratePrefs(), hydrateCerts()]);
      if (isMockApi) {
        await getMockApi()?.hydrate();
      }
      if (!cancelled) setReady(true);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemedShell splashDone={splashDone}>
      {ready && <AppNavigator />}
      {!splashDone && <AnimatedSplash ready={ready} onFinish={() => setSplashDone(true)} />}
    </ThemedShell>
  );
}

function ThemedShell({ splashDone, children }: { splashDone: boolean; children: ReactNode }) {
  const { colors, scheme } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={splashDone ? (scheme === 'dark' ? 'light' : 'dark') : 'light'} />
      {children}
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  useFlipHideSensor();
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 17 },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          headerBackVisible: false,
          headerLeft: ({ canGoBack }) => <BackButton canGoBack={canGoBack} />,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="stores-map" options={{ title: 'Магазины рядом' }} />
        <Stack.Screen name="account/index" options={{ title: 'Карта' }} />
        <Stack.Screen name="account/cash" options={{ title: 'QR' }} />
        <Stack.Screen name="account/op/[id]" options={{ title: 'Операция' }} />
        <Stack.Screen name="obnal" options={{ title: 'OOObnal' }} />
        <Stack.Screen name="offers/card" options={{ title: 'Карта' }} />
        <Stack.Screen name="offers/cashback" options={{ title: 'Кешбэк' }} />
        <Stack.Screen name="info/[id]" options={{ title: 'Подробнее' }} />
        <Stack.Screen name="scan-store" options={{ title: 'QR магазина' }} />
        <Stack.Screen name="session/[id]/cart" options={{ title: 'Корзина' }} />
        <Stack.Screen name="session/[id]/scan-item" options={{ title: 'Сканировать товар' }} />
        <Stack.Screen name="session/[id]/checkout" options={{ title: 'Оплата' }} />
        <Stack.Screen
          name="session/[id]/payment-status"
          options={{ title: 'Статус оплаты', headerBackVisible: false, headerLeft: () => null }}
        />
        <Stack.Screen
          name="session/[id]/done"
          options={{ title: 'Покупка', headerBackVisible: false, headerLeft: () => null }}
        />
        <Stack.Screen name="history/index" options={{ title: 'Мои покупки' }} />
        <Stack.Screen name="history/[id]/index" options={{ title: 'Покупка' }} />
        <Stack.Screen name="history/[id]/refund" options={{ title: 'Возврат' }} />
        <Stack.Screen name="help" options={{ title: 'Помощь' }} />
        <Stack.Screen name="profile/index" options={{ title: 'Мои данные' }} />
        <Stack.Screen name="profile/[id]" options={{ title: 'Данные' }} />
        <Stack.Screen name="accounts/index" options={{ title: 'Карты и счета' }} />
        <Stack.Screen name="accounts/[id]" options={{ title: 'Счёт' }} />
        <Stack.Screen name="limits" options={{ title: 'Лимиты' }} />
        <Stack.Screen name="certificates/index" options={{ title: 'Справки' }} />
        <Stack.Screen name="certificates/[id]" options={{ title: 'Справка' }} />
        <Stack.Screen name="support/index" options={{ title: 'Поддержка' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Вопрос' }} />
        <Stack.Screen name="prefs/index" options={{ title: 'Настройки' }} />
        <Stack.Screen name="about" options={{ title: 'О приложении' }} />
        <Stack.Screen name="demo-panel" options={{ title: 'Демо-панель', presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
