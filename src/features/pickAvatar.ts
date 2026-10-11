import { Alert, Linking, Platform } from 'react-native';

function alertDenied() {
  Alert.alert(
    'Нет доступа к фото',
    'Разрешите доступ к галерее, чтобы поставить фото профиля.',
    [
      { text: 'Не сейчас', style: 'cancel' },
      { text: 'Настройки', onPress: () => void Linking.openSettings() },
    ],
  );
}

async function ensureMediaLibraryAccess(
  ImagePicker: typeof import('expo-image-picker'),
): Promise<boolean> {
  // iOS 14+: системный выбор фото (PHPicker) не требует полного доступа к галерее.
  // Вызов requestMediaLibraryPermissionsAsync без NSPhotoLibraryUsageDescription в сборке
  // приводит к мгновенному вылету — поэтому на iOS сразу открываем picker.
  if (Platform.OS === 'ios') {
    return true;
  }

  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted) {
    return true;
  }

  alertDenied();
  return false;
}

export async function pickAvatarUri(): Promise<string | null> {
  try {
    // Lazy require: a missing native module must not crash Settings on load.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImagePicker = require('expo-image-picker') as typeof import('expo-image-picker');

    const allowed = await ensureMediaLibraryAccess(ImagePicker);
    if (!allowed) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]?.uri) return null;
    return result.assets[0].uri;
  } catch {
    Alert.alert(
      'Галерея недоступна',
      'Модуль выбора фото не попал в эту сборку. Пересоберите приложение: npx expo run:ios или npx expo run:android.',
    );
    return null;
  }
}
