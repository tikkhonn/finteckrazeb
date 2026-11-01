import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { EXIT_PASS_WINDOW_MS, exitPassRemainingMs, exitPassToken } from '@/domain/exitPass';
import { radius, spacing, useTheme } from '@/ui';

interface ExitTurnstilePassProps {
  receiptId: string;
  refundCount?: number;
}

export function ExitTurnstilePass({ receiptId, refundCount = 0 }: ExitTurnstilePassProps) {
  const { colors, shadow } = useTheme();
  const [now, setNow] = useState(() => Date.now());
  const pulse = useSharedValue(1);
  const warning = refundCount > 0;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.35, { duration: 700 }), -1, true);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const token = exitPassToken(receiptId, now);
  const seconds = Math.max(1, Math.ceil(exitPassRemainingMs(now) / 1000));
  const progress = Math.min(1, exitPassRemainingMs(now) / EXIT_PASS_WINDOW_MS);
  const status = warning
    ? `Внимание: есть заявка на возврат ${refundCount} поз.`
    : 'Корзина оплачена • Выход разрешен';

  return (
    <View style={[styles.card, shadow.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Пропуск на выход (Приложите к турникету)</Text>
      <View style={styles.qr}>
        <QRCode value={token} size={180} backgroundColor={colors.surface} color={colors.text} />
      </View>
      <View style={[styles.track, { backgroundColor: colors.chip }]}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: colors.success }]} />
      </View>
      <Text style={[styles.timer, { color: colors.textMuted }]}>Код обновится через {seconds} сек</Text>
      <View style={styles.statusRow}>
        <Animated.View
          style={[
            styles.dot,
            dotStyle,
            { backgroundColor: warning ? colors.warning : colors.success },
          ]}
        />
        <Text style={[styles.status, { color: warning ? colors.warning : colors.success }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  qr: {
    paddingVertical: spacing.sm,
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  timer: {
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
});
