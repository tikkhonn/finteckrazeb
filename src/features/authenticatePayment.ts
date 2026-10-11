import * as LocalAuthentication from 'expo-local-authentication';

import { usePrefsStore } from '@/store/prefsStore';

export async function promptBiometrics(message: string): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      return true;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      fallbackLabel: 'Подтвердить кодом',
      cancelLabel: 'Отмена',
    });
    return result.success;
  } catch {
    return true;
  }
}

export async function authenticatePayment(): Promise<boolean> {
  if (!usePrefsStore.getState().faceIdEnabled) {
    return true;
  }
  return promptBiometrics('Подтвердите оплату этой корзины');
}
