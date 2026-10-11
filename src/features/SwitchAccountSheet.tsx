import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fullName, listProfiles, type ProfileId } from '@/domain/profile';
import { BottomSheet, Button, radius, spacing, useTheme } from '@/ui';

type Props = {
  visible: boolean;
  activeId: ProfileId;
  onClose: () => void;
  onSelect: (id: ProfileId) => void;
};

export function SwitchAccountSheet({ visible, activeId, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} title="Сменить аккаунт" onClose={onClose}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>Демо-профили. Покупки и каталог не меняются.</Text>
      {listProfiles().map((profile) => {
        const selected = profile.id === activeId;
        return (
          <Pressable
            key={profile.id}
            accessibilityRole="button"
            accessibilityLabel={fullName(profile)}
            onPress={() => {
              onSelect(profile.id);
              onClose();
            }}
            style={({ pressed }) => [
              styles.row,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.infoBg : colors.surface,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.initials, { color: colors.onPrimary }]}>
                {profile.firstName.slice(0, 1)}
                {profile.lastName.slice(0, 1)}
              </Text>
            </View>
            <View style={styles.text}>
              <Text style={[styles.name, { color: colors.text }]}>{fullName(profile)}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {profile.accountName} · •• {profile.cardLast4}
              </Text>
            </View>
            {selected ? <Text style={[styles.check, { color: colors.primary }]}>✓</Text> : null}
          </Pressable>
        );
      })}
      <Button title="Отмена" variant="ghost" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 14, fontWeight: '700' },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13 },
  check: { fontSize: 18, fontWeight: '700' },
});
