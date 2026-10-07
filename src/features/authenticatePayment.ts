import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticatePayment(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      return true;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Подтвердите оплату этой корзины',
      fallbackLabel: 'Подтвердить кодом',
      cancelLabel: 'Отмена',
    });
    return result.success;
  } catch {
    return true;
  }
}
