import type {
  Cart,
  Payment,
  PaymentMethod,
  Purchase,
  PurchaseSummary,
  Refund,
  Session,
  Store,
  StoreTillExchange,
} from '@/domain/types';

/**
 * В сторону магазина уходит только {@link StoreTillExchange}: sessionToken (= id сессии),
 * позиции (SKU, qty, weightKg, price) и status PAID. PayRequest и прочие вызовы не содержат ПДн профиля.
 */

export interface PayRequest {
  cartVersion: number;
  method: PaymentMethod;
  idempotencyKey: string;
}

/** Строка — сырой код с камеры. Объект — тот же код плюс уже отсканированная марка. */
export type AddItemInput = string | { raw: string; exciseCode?: string };

export interface VtbGoApi {
  getStore(storeQr: string): Promise<Store>;
  startSession(storeId: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session>;
  addItem(sessionId: string, input: AddItemInput): Promise<Cart>;
  updateQty(sessionId: string, itemId: string, qty: number): Promise<Cart>;
  finalizeCart(sessionId: string): Promise<Cart>;
  cancelSession(sessionId: string): Promise<Session>;
  pay(sessionId: string, req: PayRequest): Promise<Payment>;
  getPayment(paymentId: string): Promise<Payment>;
  listPurchases(): Promise<PurchaseSummary[]>;
  getPurchase(sessionId: string): Promise<Purchase>;
  requestRefund(sessionId: string, itemId: string): Promise<Refund>;
  /** Передаёт обезличенный конверт кассе после успешной оплаты. */
  releaseToStore(sessionId: string): Promise<StoreTillExchange>;
}
