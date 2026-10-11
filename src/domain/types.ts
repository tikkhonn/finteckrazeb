export type SessionStatus =
  | 'shopping'
  | 'reviewing'
  | 'payment_pending'
  | 'payment_unknown'
  | 'declined'
  | 'paid_awaiting_receipt'
  | 'completed'
  | 'refund_requested'
  | 'refund_approved'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'card' | 'sbp' | 'digital_ruble';
export type PaymentStatus = 'pending' | 'unknown' | 'succeeded' | 'declined';
export type RefundStatus = 'requested' | 'approved' | 'completed';
export type Actor = 'customer' | 'store' | 'bank' | 'system';
export type CartActor = 'customer' | 'cashier';

export interface Store {
  id: string;
  name: string;
  address: string;
  qr: string;
  scenario: 'scan_and_go';
  distanceM: number;
}

export interface CatalogItem {
  barcode: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  barcode: string;
  name: string;
  unitPrice: number;
  qty: number;
  addedBy: CartActor;
}

export interface Cart {
  items: CartItem[];
  total: number;
  version: number;
}

export interface Session {
  id: string;
  storeId: string;
  storeName: string;
  status: SessionStatus;
  cart: Cart;
  paymentId?: string;
  receiptDueAt?: number;
  paymentRevealAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Consent {
  id: string;
  sessionId: string;
  cartVersion: number;
  amount: number;
  method: PaymentMethod;
  createdAt: number;
}

export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  cartVersion: number;
  idempotencyKey: string;
  createdAt: number;
}

export interface Receipt {
  id: string;
  sessionId: string;
  paymentId: string;
  fiscalMark: 'DEMO';
  number: string;
  issuedAt: number;
  items: CartItem[];
  total: number;
}

export interface Refund {
  id: string;
  sessionId: string;
  itemId: string;
  itemName: string;
  amount: number;
  status: RefundStatus;
  createdAt: number;
}

export interface DomainEvent {
  id: string;
  sessionId: string;
  action: string;
  actor: Actor;
  result: string;
  at: number;
}

export interface PurchaseSummary {
  sessionId: string;
  storeName: string;
  total: number;
  status: SessionStatus;
  paidAt?: number;
}

export interface Purchase {
  session: Session;
  payment?: Payment;
  receipt?: Receipt;
  refunds: Refund[];
}

export type PaymentSimMode = 'success' | 'decline' | 'delay' | 'lost';
export type ReceiptSimMode = 'immediate' | 'delayed';

export interface SimulatorConfig {
  paymentMode: PaymentSimMode;
  receiptMode: ReceiptSimMode;
}
