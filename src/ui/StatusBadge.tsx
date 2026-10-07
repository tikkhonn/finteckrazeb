import { StyleSheet, Text, View } from 'react-native';

import type { SessionStatus } from '@/domain/types';
import { colors, radius, spacing } from './tokens';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'pending';

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
  pending: { bg: colors.chip, fg: colors.textMuted },
};

const STATUS_LABEL: Record<SessionStatus, { label: string; tone: Tone }> = {
  shopping: { label: 'Покупка', tone: 'info' },
  reviewing: { label: 'Корзина проверена', tone: 'info' },
  payment_pending: { label: 'Оплата обрабатывается', tone: 'pending' },
  payment_unknown: { label: 'Проверяем статус', tone: 'warning' },
  declined: { label: 'Отказ банка', tone: 'danger' },
  paid_awaiting_receipt: { label: 'Оформляем чек', tone: 'warning' },
  completed: { label: 'Оплачено', tone: 'success' },
  refund_requested: { label: 'Запрос на возврат', tone: 'pending' },
  refund_approved: { label: 'Магазин подтвердил', tone: 'info' },
  refunded: { label: 'Возврат проведён', tone: 'success' },
  cancelled: { label: 'Отменено', tone: 'pending' },
};

interface StatusBadgeProps {
  status?: SessionStatus;
  label?: string;
  tone?: Tone;
}

export function StatusBadge({ status, label, tone }: StatusBadgeProps) {
  const mapped = status ? STATUS_LABEL[status] : undefined;
  const resolvedTone = tone ?? mapped?.tone ?? 'info';
  const text = label ?? mapped?.label ?? '';
  const palette = TONE_STYLES[resolvedTone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
