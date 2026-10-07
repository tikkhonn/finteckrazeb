import { assertTransition, canTransition } from '@/domain/stateMachine';
import { VtbGoError } from '@/domain/errors';

describe('state machine', () => {
  it('разрешает shopping → reviewing → payment_pending', () => {
    expect(canTransition('shopping', 'reviewing')).toBe(true);
    expect(canTransition('reviewing', 'payment_pending')).toBe(true);
  });

  it('возвращает reviewing → shopping при правке кассира', () => {
    expect(canTransition('reviewing', 'shopping')).toBe(true);
  });

  it('запрещает completed → shopping', () => {
    expect(canTransition('completed', 'shopping')).toBe(false);
    expect(() => assertTransition('completed', 'shopping')).toThrow(VtbGoError);
  });

  it('проводит цепочку оплаты и возврата', () => {
    expect(canTransition('payment_pending', 'payment_unknown')).toBe(true);
    expect(canTransition('payment_unknown', 'paid_awaiting_receipt')).toBe(true);
    expect(canTransition('paid_awaiting_receipt', 'completed')).toBe(true);
    expect(canTransition('completed', 'refund_requested')).toBe(true);
    expect(canTransition('refund_requested', 'refund_approved')).toBe(true);
    expect(canTransition('refund_approved', 'refunded')).toBe(true);
  });
});
