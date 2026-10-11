import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text } from 'react-native';

import { findCertificate } from '@/features/hubContent';
import { useCertsStore } from '@/store/certsStore';
import { useActiveProfile } from '@/store/profileStore';
import { Button, Screen, useTheme } from '@/ui';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cert = findCertificate(id ?? '');
  const profile = useActiveProfile();
  const order = useCertsStore((s) => s.order);
  const { colors } = useTheme();

  if (!cert) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Справка не найдена.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: cert.title }} />
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{cert.subtitle}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{cert.body}</Text>
      <Button
        title="Заказать"
        onPress={() => {
          order(cert.id, cert.title);
          Alert.alert(
            'Справка заказана',
            `Файл отправим на ${profile.email}. В демо письмо не уходит — запись появилась во вкладке «Заказанные».`,
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
