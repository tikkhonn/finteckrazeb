import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { HubGlyph } from './hubIcons';

type Props = HubGlyph & {
  size?: number;
};

export function HubIcon({ symbol, glyph, tint, size = 36 }: Props) {
  const mark = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.well,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: tint,
        },
      ]}
    >
      <SymbolView
        name={symbol}
        size={mark}
        tintColor="#FFFFFF"
        weight="semibold"
        fallback={
          <Text style={[styles.glyph, { fontSize: Math.round(size * 0.4), lineHeight: mark }]}>
            {glyph}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
