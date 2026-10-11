import { StyleSheet, Text, View } from 'react-native';

import { formatRub } from '@/domain/money';
import { HubIcon } from '@/features/HubIcon';
import { HubGroup, HubSection } from '@/features/HubRow';
import { HUB_GLYPHS, type HubGlyph } from '@/features/hubIcons';
import { Screen, radius, spacing, useTheme } from '@/ui';

const GROUPS: {
  title: string;
  glyph: HubGlyph;
  headline: number;
  headlineLabel: string;
  rows: { label: string; value: string }[];
}[] = [
  {
    title: 'Scan & Go',
    glyph: HUB_GLYPHS.scan,
    headline: 60_000,
    headlineLabel: 'за покупку',
    rows: [
      { label: 'За одну покупку', value: formatRub(60_000) },
      { label: 'В сутки', value: formatRub(200_000) },
      { label: 'Покупок в день', value: '15' },
    ],
  },
  {
    title: 'QR-снятие',
    glyph: HUB_GLYPHS.cash,
    headline: 30_000,
    headlineLabel: 'за операцию',
    rows: [
      { label: 'За операцию', value: formatRub(30_000) },
      { label: 'В сутки', value: formatRub(100_000) },
      { label: 'Где действует', value: 'Партнёры QR' },
    ],
  },
];

function LimitLine({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.line}>
        <Text style={[styles.lineLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.lineValue, { color: colors.text }]}>{value}</Text>
      </View>
      {divider ? <View style={[styles.hair, { backgroundColor: colors.border }]} /> : null}
    </View>
  );
}

export default function LimitsScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.tiles}>
        {GROUPS.map((item) => (
          <View key={item.title} style={[styles.tile, { backgroundColor: colors.surface }]}>
            <HubIcon {...item.glyph} />
            <Text style={[styles.headline, { color: colors.text }]}>{formatRub(item.headline)}</Text>
            <Text style={[styles.tileTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.tileLead, { color: colors.textMuted }]}>{item.headlineLabel}</Text>
          </View>
        ))}
      </View>

      {GROUPS.map((item) => (
        <View key={`${item.title}-detail`} style={styles.block}>
          <HubSection title={item.title} />
          <HubGroup>
            {item.rows.map((row, index) => (
              <LimitLine
                key={row.label}
                label={row.label}
                value={row.value}
                divider={index < item.rows.length - 1}
              />
            ))}
          </HubGroup>
        </View>
      ))}

      <View style={[styles.note, { backgroundColor: colors.chip }]}>
        <HubIcon {...HUB_GLYPHS.about} size={28} />
        <Text style={[styles.noteText, { color: colors.textMuted }]}>
          Потолки демо-режима. Банк на стороне магазина эти лимиты не подтверждает.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: radius.xxl,
    padding: spacing.md,
    minHeight: 132,
    gap: 4,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: spacing.sm,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  tileLead: {
    fontSize: 12,
    lineHeight: 16,
  },
  block: {
    gap: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  lineLabel: {
    fontSize: 15,
    flex: 1,
  },
  lineValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  hair: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
