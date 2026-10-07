export type VtbGoErrorCode =
  | 'STORE_NOT_FOUND'
  | 'SESSION_NOT_FOUND'
  | 'ITEM_NOT_FOUND'
  | 'CART_VERSION_STALE'
  | 'INVALID_STATE'
  | 'NETWORK_LOST'
  | 'PAYMENT_NOT_FOUND'
  | 'REFUND_NOT_FOUND'
  | 'EMPTY_CART';

export class VtbGoError extends Error {
  constructor(
    public readonly code: VtbGoErrorCode,
    message: string,
    public readonly extras?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'VtbGoError';
  }
}

export function isVtbGoError(error: unknown): error is VtbGoError {
  return error instanceof VtbGoError;
}
