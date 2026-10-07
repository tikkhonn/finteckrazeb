import type { SessionStatus } from './types';
import { VtbGoError } from './errors';

export const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  shopping: ['reviewing', 'cancelled'],
  reviewing: ['shopping', 'payment_pending', 'cancelled'],
  payment_pending: ['payment_unknown', 'declined', 'paid_awaiting_receipt'],
  payment_unknown: ['payment_pending', 'declined', 'paid_awaiting_receipt'],
  declined: ['reviewing', 'cancelled', 'payment_pending'],
  paid_awaiting_receipt: ['completed'],
  completed: ['refund_requested'],
  refund_requested: ['refund_approved'],
  refund_approved: ['refunded'],
  refunded: [],
  cancelled: [],
};

export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: SessionStatus, to: SessionStatus): void {
  if (!canTransition(from, to)) {
    throw new VtbGoError(
      'INVALID_STATE',
      `Нельзя перейти из состояния «${from}» в «${to}»`,
      { from, to },
    );
  }
}

export const EDITABLE_STATUSES: SessionStatus[] = ['shopping', 'reviewing', 'declined'];

export const PURCHASE_HISTORY_STATUSES: SessionStatus[] = [
  'paid_awaiting_receipt',
  'completed',
  'refund_requested',
  'refund_approved',
  'refunded',
];
