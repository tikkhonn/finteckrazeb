import type {
  Cart,
  Payment,
  PaymentMethod,
  Purchase,
  PurchaseSummary,
  Refund,
  Session,
  Store,
} from '@/domain/types';

export interface PayRequest {
  cartVersion: number;
  method: PaymentMethod;
  idempotencyKey: string;
}

export interface VtbGoApi {
  getStore(storeQr: string): Promise<Store>;
  startSession(storeId: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session>;
  addItem(sessionId: string, barcode: string): Promise<Cart>;
  updateQty(sessionId: string, itemId: string, qty: number): Promise<Cart>;
  finalizeCart(sessionId: string): Promise<Cart>;
  cancelSession(sessionId: string): Promise<Session>;
  pay(sessionId: string, req: PayRequest): Promise<Payment>;
  getPayment(paymentId: string): Promise<Payment>;
  listPurchases(): Promise<PurchaseSummary[]>;
  getPurchase(sessionId: string): Promise<Purchase>;
  requestRefund(sessionId: string, itemId: string): Promise<Refund>;
}
