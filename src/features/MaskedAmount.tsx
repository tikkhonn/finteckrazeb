import { useState } from 'react';
import { Pressable, Text, type StyleProp, type TextStyle } from 'react-native';

import { formatRub } from '@/domain/money';
import { usePrefsStore } from '@/store/prefsStore';

type Props = {
  value: number;
  style?: StyleProp<TextStyle>;
  /** Нельзя вкладывать Pressable в другую кнопку (главная карта на вебе). */
  interactive?: boolean;
};

export function MaskedAmount({ value, style, interactive = true }: Props) {
  const hideBalances = usePrefsStore((s) => s.hideBalances);
  const [hideSnapshot, setHideSnapshot] = useState(hideBalances);
  const [revealed, setRevealed] = useState(false);
  if (hideSnapshot !== hideBalances) {
    setHideSnapshot(hideBalances);
    setRevealed(false);
  }
  const hidden = hideBalances && !revealed;
  const label = hidden ? '•••• ₽' : formatRub(value);
  const amount = <Text style={style}>{label}</Text>;

  if (!interactive || !hideBalances) {
    return amount;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hidden ? 'Баланс скрыт, нажмите чтобы показать' : formatRub(value)}
      onPress={(event) => {
        event.stopPropagation();
        setRevealed((current) => !current);
      }}
    >
      {amount}
    </Pressable>
  );
}
