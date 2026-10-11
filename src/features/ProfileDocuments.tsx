import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DOCUMENT_TITLES,
  addableDocumentTypes,
  type DocumentType,
  type ResolvedProfile,
} from '@/domain/profile';
import { BottomSheet, Button, Card, ListRow, useTheme } from '@/ui';

type Props = {
  profile: ResolvedProfile;
  onAdd: (type: DocumentType) => void;
};

export function ProfileDocuments({ profile, onAdd }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const addable = addableDocumentTypes(profile.documents.map((item) => item.type));

  return (
    <>
      <Card variant="elevated">
        <Text style={[styles.label, { color: colors.textMuted }]}>Документы</Text>
        {profile.documents.map((item) => (
          <View key={item.type} style={[styles.row, { borderBottomColor: colors.border }]}>
            <ListRow
              title={item.title}
              subtitle={item.value}
              chevron
              onPress={() => router.push(`/profile/${item.type}`)}
            />
          </View>
        ))}
        {addable.length > 0 ? (
          <Button title="Добавить документ" variant="secondary" onPress={() => setOpen(true)} />
        ) : (
          <Text style={[styles.done, { color: colors.textMuted }]}>Все доступные документы уже добавлены</Text>
        )}
      </Card>

      <BottomSheet visible={open} title="Добавить документ" onClose={() => setOpen(false)}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Демо-карточка появится в списке. Данные нельзя отредактировать.
        </Text>
        {addable.map((type) => (
          <Button
            key={type}
            title={DOCUMENT_TITLES[type]}
            variant="secondary"
            onPress={() => {
              onAdd(type);
              setOpen(false);
            }}
          />
        ))}
        <Button title="Отмена" variant="ghost" onPress={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600' },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hint: { fontSize: 14, lineHeight: 20 },
  done: { fontSize: 13 },
});
