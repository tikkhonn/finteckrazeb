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
  /** Обязательная марка DataMatrix / PDF417 на каждую единицу. */
  requiresExcise?: boolean;
  /** Энергетики и прочие 18+. */
  isAdultOnly?: boolean;
  /** Весовой товар: цена за 1 кг, ищется по PLU. */
  isWeighted?: boolean;
  /** 5 цифр PLU для штрихкода весов. */
  pluCode?: string;
  /** Доля кешбэка, например 0.05 или 0.15. По умолчанию 0.05. */
  cashbackRate?: number;
}

export interface CartItem {
  id: string;
  barcode: string;
  name: string;
  unitPrice: number;
  qty: number;
  addedBy: CartActor;
  exciseCodes: string[];
  weightKg?: number;
  /** Вклад строки в кешбэк по карте ВТБ, до коэффициента способа оплаты. */
  calculatedCashback: number;
  cashbackRate?: number;
  isAdultOnly?: boolean;
}

export interface Cart {
  items: CartItem[];
  total: number;
  version: number;
}

export type RiskLevel = 'clear' | 'yellow' | 'red';
export type RiskResolution = 'pending' | 'ok' | 'mismatch';

export interface SessionRemovedLine {
  name: string;
  unitPrice: number;
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
  removedBeforePay?: SessionRemovedLine[];
}

export interface UserRiskState {
  profileId: string;
  softDecayRemaining: number;
  monitoringVisitsRemaining: number;
  mismatchCount: number;
  forceCheck: boolean;
}

export interface RiskSpotItem {
  name: string;
  qty: number;
  amount: number;
}

export interface RiskCheck {
  sessionId: string;
  profileId: string;
  level: RiskLevel;
  reasons: string[];
  customerNotice: boolean;
  attentionRequired: boolean;
  monitoringOnly?: boolean;
  spotItems: RiskSpotItem[];
  itemCount: number;
  total: number;
  paidAt: number;
  resolved: RiskResolution;
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
  customerNotice?: boolean;
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
  exitPassToken: string;
  exitPassExpiresAt: number;
  cashbackEarned: number;
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
  riskCheck?: RiskCheck;
}

export type StoreTillStatus = 'PAID';

export interface StoreTillLine {
  sku: string;
  qty: number;
  price: number;
  weightKg?: number;
}

/** Обезличенный пакет в сторону магазина: без ФИО, телефона и карты. */
export interface StoreTillExchange {
  sessionToken: string;
  items: StoreTillLine[];
  status: StoreTillStatus;
}

export interface ExitLaneEntry {
  sessionId: string;
  storeName: string;
  itemCount: number;
  total: number;
  paidAt: number;
}

export interface AttentionEntry {
  sessionId: string;
  storeName: string;
  level: RiskLevel;
  reasons: string[];
  spotItems: RiskSpotItem[];
  itemCount: number;
  total: number;
  paidAt: number;
}

export type CatalogPreset = 'basic' | 'full';
export type PaymentSimMode = 'success' | 'decline' | 'delay' | 'lost';
export type ReceiptSimMode = 'immediate' | 'delayed';

export interface SimulatorConfig {
  paymentMode: PaymentSimMode;
  receiptMode: ReceiptSimMode;
}
