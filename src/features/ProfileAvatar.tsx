import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { initials, type ResolvedProfile } from '@/domain/profile';
import { pickAvatarUri } from './pickAvatar';
import { useTheme } from '@/ui';

const SIZE = 88;

type Props = {
  profile: ResolvedProfile;
  onPicked: (uri: string) => void;
  ring?: boolean;
};

export function ProfileAvatar({ profile, onPicked, ring = false }: Props) {
  const { colors, shadow } = useTheme();
  async function pick() {
    const uri = await pickAvatarUri();
    if (uri) onPicked(uri);
  }

  const letters = initials(profile);

  const avatar = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Выбрать фото профиля"
      onPress={() => void pick()}
      style={({ pressed }) => [styles.wrap, !ring && shadow.soft, pressed && styles.pressed]}
    >
      {profile.avatarUri ? (
        <Image
          source={{ uri: profile.avatarUri }}
          style={[styles.image, { backgroundColor: colors.chip }]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.onPrimary }]}>{letters}</Text>
        </View>
      )}
      <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.badgeMark, { color: colors.primary }]}>✎</Text>
      </View>
    </Pressable>
  );

  if (!ring) {
    return avatar;
  }

  return (
    <View
      style={[
        styles.ring,
        { borderColor: colors.accent, backgroundColor: colors.chip },
      ]}
    >
      {avatar}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 3,
    borderWidth: 2,
    borderRadius: (SIZE + 10) / 2,
  },
  wrap: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  pressed: { opacity: 0.85 },
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  fallback: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 28, fontWeight: '700' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeMark: { fontSize: 12 },
});
