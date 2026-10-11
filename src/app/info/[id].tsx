import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { INFO_PAGES } from '@/features/homeContent';
import { PlaceholderSection } from '@/features/PlaceholderSection';
import { Screen, useTheme } from '@/ui';

export default function InfoScreen() {
  const { typography } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const page = typeof id === 'string' ? INFO_PAGES[id] : undefined;

  if (!page) {
    return (
      <Screen background="sky">
        <Text style={typography.body}>Материал не найден</Text>
      </Screen>
    );
  }

  return (
    <PlaceholderSection title={page.title} subtitle={page.subtitle} bullets={page.bullets} />
  );
}
