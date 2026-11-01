export const EXIT_PASS_WINDOW_MS = 30_000;

export function exitPassSlot(now: number): number {
  return Math.floor(now / EXIT_PASS_WINDOW_MS);
}

export function exitPassToken(receiptId: string, now: number): string {
  return `VTBGO-EXIT-${receiptId}-${exitPassSlot(now)}`;
}

export function exitPassExpiresAt(now: number): number {
  return (exitPassSlot(now) + 1) * EXIT_PASS_WINDOW_MS;
}

export function exitPassRemainingMs(now: number): number {
  const remaining = exitPassExpiresAt(now) - now;
  return remaining > 0 ? remaining : EXIT_PASS_WINDOW_MS;
}
