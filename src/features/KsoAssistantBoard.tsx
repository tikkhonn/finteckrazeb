import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getMockApi } from '@/api/apiProvider';
import { isVtbGoError } from '@/domain/errors';
import { formatRub } from '@/domain/money';
import type { AttentionEntry, ExitLaneEntry } from '@/domain/types';
import { Button, Card, Chip, spacing, useTheme } from '@/ui';

function levelColor(level: string, colors: ReturnType<typeof useTheme>['colors']) {
  if (level === 'red') {
    return colors.danger;
  }
  if (level === 'yellow') {
    return '#B86E00';
  }
  return colors.success;
}

export function KsoAssistantBoard() {
  const { colors } = useTheme();
  const mock = getMockApi();
  const [exit, setExit] = useState<ExitLaneEntry[]>([]);
  const [attention, setAttention] = useState<AttentionEntry[]>([]);

  useEffect(() => {
    if (!mock) {
      return;
    }
    const pull = () => {
      const board = mock.listAssistantBoard();
      setExit(board.exit);
      setAttention(board.attention);
    };
    pull();
    const timer = setInterval(pull, 1000);
    return () => clearInterval(timer);
  }, [mock]);

  async function onOk(sessionId: string) {
    if (!mock) {
      return;
    }
    try {
      await mock.confirmRiskCheck(sessionId);
    } catch (err) {
      Alert.alert('Сверка', isVtbGoError(err) ? err.message : 'Не удалось подтвердить');
    }
  }

  async function onMismatch(sessionId: string) {
    if (!mock) {
      return;
    }
    try {
      await mock.reportRiskMismatch(sessionId);
    } catch (err) {
      Alert.alert('Сверка', isVtbGoError(err) ? err.message : 'Не удалось зафиксировать');
    }
  }

  return (
    <View style={styles.root}>
      <Card>
        <Text style={[styles.section, { color: colors.text }]}>Оплатили и выходят сейчас</Text>
        {exit.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Никого у выхода</Text>
        ) : (
          exit.map((item) => (
            <View key={item.sessionId} style={[styles.row, { borderColor: colors.border }]}>
              <Chip label="ОПЛАЧЕНО" variant="onDark" />
              <Text style={[styles.sessionId, { color: colors.textMuted }]}>Сессия {item.sessionId}</Text>
              <Text style={[styles.store, { color: colors.text }]}>{item.storeName}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {item.itemCount} поз. · {formatRub(item.total)}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <Text style={[styles.section, { color: colors.text }]}>Требуют внимания</Text>
        {attention.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Очередь пуста</Text>
        ) : (
          attention.map((item) => (
            <View key={item.sessionId} style={[styles.alertBox, { borderColor: levelColor(item.level, colors) }]}>
              <Text style={[styles.sessionId, { color: colors.textMuted }]}>Сессия {item.sessionId}</Text>
              <Text style={[styles.store, { color: colors.text }]}>{item.storeName}</Text>
              <Text style={[styles.meta, { color: levelColor(item.level, colors) }]}>
                {item.itemCount} поз. · {formatRub(item.total)}
              </Text>
              {item.reasons.map((reason) => (
                <Text key={reason} style={[styles.reason, { color: colors.textMuted }]}>
                  • {reason}
                </Text>
              ))}
              <Text style={[styles.subhead, { color: colors.text }]}>Быстрая сверка 2 позиций</Text>
              {item.spotItems.map((spot) => (
                <Text key={`${item.sessionId}-${spot.name}`} style={{ color: colors.text, fontSize: 13 }}>
                  {spot.name} ×{spot.qty} — {formatRub(spot.amount)}
                </Text>
              ))}
              <View style={styles.actions}>
                <Button title="Сверка ОК" onPress={() => void onOk(item.sessionId)} />
                <Button title="Расхождение" variant="danger" onPress={() => void onMismatch(item.sessionId)} />
              </View>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing.md,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  alertBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  store: {
    fontSize: 15,
    fontWeight: '700',
  },
  sessionId: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
  },
  reason: {
    fontSize: 13,
    lineHeight: 18,
  },
  subhead: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});