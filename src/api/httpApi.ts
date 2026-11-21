import type { AddItemInput, PayRequest, VtbGoApi } from '@/api/contract';
import { VtbGoError } from '@/domain/errors';
import { buildStoreTillExchange } from '@/domain/storeTill';
import type {
  Cart,
  Payment,
  Purchase,
  PurchaseSummary,
  Refund,
  Session,
  Store,
  StoreTillExchange,
} from '@/domain/types';

const PAID_STATUSES = new Set<Session['status']>([
  'paid_awaiting_receipt',
  'completed',
  'refund_requested',
  'refund_approved',
  'refunded',
]);

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new VtbGoError(
      (body.code as VtbGoError['code']) ?? 'INVALID_STATE',
      body.message ?? 'Ошибка сервера',
    );
  }
  return body as T;
}

export class HttpApi implements VtbGoApi {
  constructor(private readonly baseUrl: string) {}

  getStore(storeQr: string) {
    return request<Store>(this.baseUrl, `/stores/by-qr?qr=${encodeURIComponent(storeQr)}`);
  }

  startSession(storeId: string) {
    return request<Session>(this.baseUrl, '/sessions', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  getSession(sessionId: string) {
    return request<Session>(this.baseUrl, `/sessions/${sessionId}`);
  }

  addItem(sessionId: string, input: AddItemInput) {
    const body = typeof input === 'string' ? { barcode: input } : { barcode: input.raw, exciseCode: input.exciseCode };
    return request<Cart>(this.baseUrl, `/sessions/${sessionId}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateQty(sessionId: string, itemId: string, qty: number) {
    return request<Cart>(this.baseUrl, `/sessions/${sessionId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty }),
    });
  }

  finalizeCart(sessionId: string) {
    return request<Cart>(this.baseUrl, `/sessions/${sessionId}/finalize`, { method: 'POST' });
  }

  cancelSession(sessionId: string) {
    return request<Session>(this.baseUrl, `/sessions/${sessionId}/cancel`, { method: 'POST' });
  }

  pay(sessionId: string, req: PayRequest) {
    return request<Payment>(this.baseUrl, `/sessions/${sessionId}/pay`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  getPayment(paymentId: string) {
    return request<Payment>(this.baseUrl, `/payments/${paymentId}`);
  }

  listPurchases() {
    return request<PurchaseSummary[]>(this.baseUrl, '/purchases');
  }

  getPurchase(sessionId: string) {
    return request<Purchase>(this.baseUrl, `/purchases/${sessionId}`);
  }

  requestRefund(sessionId: string, itemId: string) {
    return request<Refund>(this.baseUrl, `/sessions/${sessionId}/refunds`, {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  async releaseToStore(sessionId: string): Promise<StoreTillExchange> {
    const session = await this.getSession(sessionId);
    if (!PAID_STATUSES.has(session.status)) {
      throw new VtbGoError('INVALID_STATE', 'Конверт для кассы доступен после успешной оплаты.');
    }
    const exchange = buildStoreTillExchange(session.id, session.cart.items);
    await request<StoreTillExchange>(this.baseUrl, `/sessions/${sessionId}/store-till`, {
      method: 'POST',
      body: JSON.stringify(exchange),
    });
    return exchange;
  }
}
