import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { profileFields } from '@/domain/profile';
import { ProfileDocuments } from '@/features/ProfileDocuments';
import { useActiveProfile, useProfileStore } from '@/store/profileStore';
import { Card, ListRow, Screen, useTheme } from '@/ui';

export default function ProfileDataScreen() {
  const profile = useActiveProfile();
  const { colors } = useTheme();
  const addDocument = useProfileStore((s) => s.addDocument);
  const fields = profileFields(profile);

  return (
    <Screen>
      <Card variant="elevated">
        {fields.map((item, index) => (
          <View
            key={item.id}
            style={index < fields.length - 1 ? [styles.row, { borderBottomColor: colors.border }] : undefined}
          >
            <ListRow
              title={item.title}
              subtitle={item.value}
              chevron
              onPress={() => router.push(`/profile/${item.id}`)}
            />
          </View>
        ))}
      </Card>

      <ProfileDocuments profile={profile} onAdd={addDocument} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
