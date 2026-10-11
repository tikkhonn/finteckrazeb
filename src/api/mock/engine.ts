import catalogData from './catalog.json';
import { withTotals } from '@/domain/cart';
import { assertEan13 } from '@/domain/ean';
import { VtbGoError } from '@/domain/errors';
import { assertTransition, EDITABLE_STATUSES, PURCHASE_HISTORY_STATUSES } from '@/domain/stateMachine';
import type {
  Cart,
  CartActor,
  CartItem,
  CatalogItem,
  Consent,
  DomainEvent,
  Payment,
  Purchase,
  PurchaseSummary,
  Receipt,
  Refund,
  Session,
  SimulatorConfig,
  Store,
} from '@/domain/types';
import type { PayRequest } from '@/api/contract';
import { findStoreById, findStoreByQr, STORES } from './stores';
import { emptyState, type MockState } from './state';

const SEED_CATALOG = catalogData as CatalogItem[];
const RECEIPT_DELAY_MS = 4000;
const PAYMENT_DELAY_MS = 5000;
const LOST_REVEAL_MS = 8000;

export interface EngineDeps {
  now: () => number;
  getSim: () => SimulatorConfig;
}

export function seedCatalog(): CatalogItem[] {
  return SEED_CATALOG.map((item) => ({ ...item }));
}

export class MockEngine {
  constructor(
    public state: MockState,
    private readonly deps: EngineDeps,
    public catalog: CatalogItem[] = seedCatalog(),
  ) {}

  static create(deps: EngineDeps, state?: MockState): MockEngine {
    return new MockEngine(state ?? emptyState(), deps);
  }

  getCatalog(): CatalogItem[] {
    return this.catalog.map((item) => ({ ...item }));
  }

  upsertCatalogItem(input: CatalogItem): CatalogItem {
    const name = input.name.trim();
    if (!name) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', 'Укажите название товара.');
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new VtbGoError('INVALID_CATALOG_ITEM', 'Цена должна быть больше нуля.');
    }
    const item: CatalogItem = {
      barcode: assertEan13(input.barcode),
      name,
      price: Math.round(input.price * 100) / 100,
    };
    const index = this.catalog.findIndex((entry) => entry.barcode === item.barcode);
    if (index >= 0) {
      this.catalog[index] = item;
    } else {
      this.catalog.push(item);
    }
    return { ...item };
  }

  deleteCatalogItem(barcode: string): void {
    this.catalog = this.catalog.filter((item) => item.barcode !== barcode);
  }

  resetCatalogToSeed(): void {
    this.catalog = seedCatalog();
  }

  listStores(): Store[] {
    return [...STORES];
  }

  listEvents(sessionId?: string): DomainEvent[] {
    const events = this.state.events;
    if (!sessionId) {
      return [...events];
    }
    return events.filter((event) => event.sessionId === sessionId);
  }

  getStore(storeQr: string): Store {
    const store = findStoreByQr(storeQr);
    if (!store) {
      throw new VtbGoError('STORE_NOT_FOUND', 'Магазин не найден. Отсканируйте QR торговой точки.');
    }
    return store;
  }

  startSession(storeId: string): Session {
    const store = findStoreById(storeId);
    if (!store) {
      throw new VtbGoError('STORE_NOT_FOUND', 'Магазин не найден.');
    }
    const now = this.deps.now();
    const session: Session = {
      id: this.nextId('ses'),
      storeId: store.id,
      storeName: store.name,
      status: 'shopping',
      cart: withTotals([], 1),
      createdAt: now,
      updatedAt: now,
    };
    this.state.sessions[session.id] = session;
    this.record(session.id, 'start_session', 'customer', `Сессия в «${store.name}»`);
    return this.cloneSession(session);
  }

  getSession(sessionId: string): Session {
    this.tick(sessionId);
    return this.cloneSession(this.requireSession(sessionId));
  }

  addItem(sessionId: string, barcode: string, actor: CartActor = 'customer'): Cart {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    this.assertEditable(session);
    let code: string;
    try {
      code = assertEan13(barcode);
    } catch (error) {
      this.record(sessionId, 'invalid_barcode', actor === 'cashier' ? 'store' : 'customer', barcode);
      throw error;
    }
    const product = this.catalog.find((item) => item.barcode === code);
    if (!product) {
      this.record(sessionId, 'item_not_found', actor === 'cashier' ? 'store' : 'customer', barcode);
      throw new VtbGoError('ITEM_NOT_FOUND', 'Товар не найден. Обратитесь к сотруднику.');
    }

    const items = session.cart.items.map((item) => ({ ...item }));
    const existing = items.find((item) => item.barcode === product.barcode);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: `item_${product.barcode}`,
        barcode: product.barcode,
        name: product.name,
        unitPrice: product.price,
        qty: 1,
        addedBy: actor,
      });
    }

    this.replaceCart(session, items);
    this.record(
      sessionId,
      actor === 'cashier' ? 'cashier_add_item' : 'add_item',
      actor === 'cashier' ? 'store' : 'customer',
      `${product.name} ×1`,
    );
    return this.cloneCart(session.cart);
  }

  updateQty(sessionId: string, itemId: string, qty: number): Cart {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    this.assertEditable(session);
    if (!Number.isInteger(qty) || qty < 0) {
      throw new VtbGoError('INVALID_STATE', 'Количество должно быть целым неотрицательным числом.');
    }

    const items = session.cart.items
      .map((item) => ({ ...item }))
      .filter((item) => (item.id === itemId ? qty > 0 : true))
      .map((item) => (item.id === itemId ? { ...item, qty } : item));

    if (qty > 0 && !items.some((item) => item.id === itemId)) {
      throw new VtbGoError('ITEM_NOT_FOUND', 'Позиция не найдена в корзине.');
    }

    this.replaceCart(session, items);
    this.record(sessionId, 'update_qty', 'customer', `${itemId} → ${qty}`);
    return this.cloneCart(session.cart);
  }

  finalizeCart(sessionId: string): Cart {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    this.assertEditable(session);
    if (session.cart.items.length === 0) {
      throw new VtbGoError('EMPTY_CART', 'Корзина пуста.');
    }
    if (session.status === 'shopping' || session.status === 'declined') {
      this.transition(session, 'reviewing');
    }
    session.cart = withTotals(session.cart.items, session.cart.version);
    session.updatedAt = this.deps.now();
    this.record(
      sessionId,
      'finalize_cart',
      'store',
      `Версия ${session.cart.version}, итог ${session.cart.total} ₽`,
    );
    return this.cloneCart(session.cart);
  }

  cancelSession(sessionId: string): Session {
    const session = this.requireSession(sessionId);
    this.transition(session, 'cancelled');
    this.record(sessionId, 'cancel_session', 'customer', 'Покупатель отменил покупку');
    return this.cloneSession(session);
  }

  pay(sessionId: string, req: PayRequest): Payment {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);

    const existingId = this.state.idempotency[req.idempotencyKey];
    if (existingId) {
      this.revealIfHidden(existingId);
      this.tick(sessionId);
      return this.clonePayment(this.requirePayment(existingId));
    }

    if (session.paymentId) {
      const current = this.state.payments[session.paymentId];
      if (current && (current.status === 'pending' || current.status === 'unknown' || current.status === 'succeeded')) {
        return this.clonePayment(current);
      }
    }

    if (req.cartVersion !== session.cart.version) {
      throw new VtbGoError(
        'CART_VERSION_STALE',
        'Корзина изменилась. Подтвердите новую сумму.',
        { currentVersion: session.cart.version, requestedVersion: req.cartVersion },
      );
    }
    if (session.status !== 'reviewing' && session.status !== 'declined') {
      throw new VtbGoError('INVALID_STATE', 'Оплатить можно только проверенную корзину.');
    }

    const now = this.deps.now();
    const consent: Consent = {
      id: this.nextId('cns'),
      sessionId,
      cartVersion: req.cartVersion,
      amount: session.cart.total,
      method: req.method,
      createdAt: now,
    };
    this.state.consents[consent.id] = consent;

    const payment: Payment = {
      id: this.nextId('pay'),
      sessionId,
      amount: session.cart.total,
      method: req.method,
      status: 'pending',
      cartVersion: req.cartVersion,
      idempotencyKey: req.idempotencyKey,
      createdAt: now,
    };
    this.state.payments[payment.id] = payment;
    this.state.idempotency[req.idempotencyKey] = payment.id;
    session.paymentId = payment.id;
    this.transition(session, 'payment_pending');
    this.record(
      sessionId,
      'consent',
      'customer',
      `Согласие: версия ${req.cartVersion}, ${session.cart.total} ₽, ${req.method}`,
    );

    const sim = this.deps.getSim();
    if (sim.paymentMode === 'decline') {
      payment.status = 'declined';
      this.transition(session, 'declined');
      this.record(sessionId, 'payment_declined', 'bank', 'Банк отклонил операцию');
      return this.clonePayment(payment);
    }

    if (sim.paymentMode === 'lost') {
      payment.status = 'unknown';
      this.state.hiddenOutcomes[payment.id] = 'succeeded';
      session.paymentRevealAt = now + LOST_REVEAL_MS;
      this.transition(session, 'payment_unknown');
      this.record(sessionId, 'payment_response_lost', 'system', 'Ответ об оплате не доставлен');
      throw new VtbGoError('NETWORK_LOST', 'Не удалось получить ответ банка. Проверяем статус операции.', {
        paymentId: payment.id,
        sessionId,
      });
    }

    if (sim.paymentMode === 'delay') {
      this.state.hiddenOutcomes[payment.id] = 'succeeded';
      session.paymentRevealAt = now + PAYMENT_DELAY_MS;
      this.record(sessionId, 'payment_pending', 'bank', 'Ожидаем ответ банка');
      return this.clonePayment(payment);
    }

    this.succeedPayment(session, payment, sim.receiptMode);
    return this.clonePayment(payment);
  }

  getPayment(paymentId: string): Payment {
    const payment = this.requirePayment(paymentId);
    this.tick(payment.sessionId);
    return this.clonePayment(this.requirePayment(paymentId));
  }

  listPurchases(): PurchaseSummary[] {
    Object.keys(this.state.sessions).forEach((id) => this.tick(id));
    return Object.values(this.state.sessions)
      .filter((session) => PURCHASE_HISTORY_STATUSES.includes(session.status))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((session) => ({
        sessionId: session.id,
        storeName: session.storeName,
        total: session.cart.total,
        status: session.status,
        paidAt: session.paymentId ? this.state.payments[session.paymentId]?.createdAt : undefined,
      }));
  }

  getPurchase(sessionId: string): Purchase {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    const payment = session.paymentId ? this.state.payments[session.paymentId] : undefined;
    const receipt = Object.values(this.state.receipts).find((item) => item.sessionId === sessionId);
    const refunds = Object.values(this.state.refunds).filter((item) => item.sessionId === sessionId);
    return {
      session: this.cloneSession(session),
      payment: payment ? this.clonePayment(payment) : undefined,
      receipt: receipt ? { ...receipt, items: receipt.items.map((item) => ({ ...item })) } : undefined,
      refunds: refunds.map((item) => ({ ...item })),
    };
  }

  requestRefund(sessionId: string, itemId: string): Refund {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    if (session.status !== 'completed' && session.status !== 'refunded' && session.status !== 'refund_requested' && session.status !== 'refund_approved') {
      throw new VtbGoError('INVALID_STATE', 'Возврат доступен после завершения покупки.');
    }
    const item = session.cart.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new VtbGoError('ITEM_NOT_FOUND', 'Позиция не найдена в покупке.');
    }
    const already = Object.values(this.state.refunds).find(
      (entry) => entry.sessionId === sessionId && entry.itemId === itemId,
    );
    if (already) {
      return { ...already };
    }
    const refund: Refund = {
      id: this.nextId('rfd'),
      sessionId,
      itemId: item.id,
      itemName: item.name,
      amount: item.unitPrice * item.qty,
      status: 'requested',
      createdAt: this.deps.now(),
    };
    this.state.refunds[refund.id] = refund;
    if (session.status === 'completed') {
      this.transition(session, 'refund_requested');
    }
    this.record(sessionId, 'refund_requested', 'customer', `${item.name} на ${refund.amount} ₽`);
    return { ...refund };
  }

  approveRefund(sessionId: string): Refund {
    const refund = this.latestRefund(sessionId);
    if (refund.status !== 'requested') {
      throw new VtbGoError('INVALID_STATE', 'Магазин уже обработал этот запрос.');
    }
    const session = this.requireSession(sessionId);
    refund.status = 'approved';
    this.transition(session, 'refund_approved');
    this.record(sessionId, 'refund_approved', 'store', `Магазин подтвердил возврат «${refund.itemName}»`);
    return { ...refund };
  }

  completeRefund(sessionId: string): Refund {
    const refund = this.latestRefund(sessionId);
    if (refund.status !== 'approved') {
      throw new VtbGoError('INVALID_STATE', 'Сначала магазин должен подтвердить возврат.');
    }
    const session = this.requireSession(sessionId);
    refund.status = 'completed';
    this.transition(session, 'refunded');
    this.record(sessionId, 'refund_completed', 'bank', `Возврат ${refund.amount} ₽ проведён`);
    return { ...refund };
  }

  reset(): void {
    this.state = emptyState();
  }

  tick(sessionId: string): void {
    const session = this.state.sessions[sessionId];
    if (!session) {
      return;
    }
    const now = this.deps.now();
    if (
      session.paymentId &&
      session.paymentRevealAt &&
      now >= session.paymentRevealAt &&
      this.state.hiddenOutcomes[session.paymentId]
    ) {
      this.revealIfHidden(session.paymentId);
    }
    if (
      session.status === 'paid_awaiting_receipt' &&
      session.receiptDueAt &&
      now >= session.receiptDueAt
    ) {
      this.issueReceipt(session);
    }
  }

  private revealIfHidden(paymentId: string): void {
    const outcome = this.state.hiddenOutcomes[paymentId];
    if (!outcome) {
      return;
    }
    const payment = this.requirePayment(paymentId);
    const session = this.requireSession(payment.sessionId);
    delete this.state.hiddenOutcomes[paymentId];
    session.paymentRevealAt = undefined;
    if (outcome === 'succeeded') {
      this.succeedPayment(session, payment, this.deps.getSim().receiptMode);
    } else {
      payment.status = 'declined';
      this.transition(session, 'declined');
    }
  }

  private succeedPayment(session: Session, payment: Payment, receiptMode: SimulatorConfig['receiptMode']): void {
    payment.status = 'succeeded';
    this.record(session.id, 'payment_succeeded', 'bank', `Оплачено ${payment.amount} ₽`);
    if (session.status !== 'paid_awaiting_receipt' && session.status !== 'completed') {
      this.transition(session, 'paid_awaiting_receipt');
    }
    if (receiptMode === 'delayed') {
      session.receiptDueAt = this.deps.now() + RECEIPT_DELAY_MS;
      this.record(session.id, 'receipt_pending', 'store', 'Касса формирует чек');
      return;
    }
    this.issueReceipt(session);
  }

  private issueReceipt(session: Session): void {
    if (!session.paymentId) {
      return;
    }
    const existing = Object.values(this.state.receipts).find((item) => item.sessionId === session.id);
    if (existing) {
      if (session.status === 'paid_awaiting_receipt') {
        this.transition(session, 'completed');
      }
      return;
    }
    const payment = this.requirePayment(session.paymentId);
    const receipt: Receipt = {
      id: this.nextId('rcpt'),
      sessionId: session.id,
      paymentId: payment.id,
      fiscalMark: 'DEMO',
      number: `ДЕМО-${this.state.seq.toString().padStart(4, '0')}`,
      issuedAt: this.deps.now(),
      items: session.cart.items.map((item) => ({ ...item })),
      total: session.cart.total,
    };
    this.state.receipts[receipt.id] = receipt;
    session.receiptDueAt = undefined;
    this.transition(session, 'completed');
    this.record(session.id, 'receipt_issued', 'store', `Чек ${receipt.number} (демо)`);
  }

  private replaceCart(session: Session, items: CartItem[]): void {
    const nextVersion = session.cart.version + 1;
    session.cart = withTotals(items, nextVersion);
    session.updatedAt = this.deps.now();
    if (session.status === 'reviewing') {
      this.transition(session, 'shopping');
    } else if (session.status === 'declined') {
      this.transition(session, 'reviewing');
      this.transition(session, 'shopping');
    }
  }

  private assertEditable(session: Session): void {
    if (!EDITABLE_STATUSES.includes(session.status)) {
      throw new VtbGoError('INVALID_STATE', 'Корзину уже нельзя изменить.');
    }
  }

  private transition(session: Session, to: Session['status']): void {
    assertTransition(session.status, to);
    session.status = to;
    session.updatedAt = this.deps.now();
  }

  private requireSession(sessionId: string): Session {
    const session = this.state.sessions[sessionId];
    if (!session) {
      throw new VtbGoError('SESSION_NOT_FOUND', 'Сессия покупки не найдена.');
    }
    return session;
  }

  private requirePayment(paymentId: string): Payment {
    const payment = this.state.payments[paymentId];
    if (!payment) {
      throw new VtbGoError('PAYMENT_NOT_FOUND', 'Платёж не найден.');
    }
    return payment;
  }

  private latestRefund(sessionId: string): Refund {
    const refunds = Object.values(this.state.refunds)
      .filter((item) => item.sessionId === sessionId)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (!refunds[0]) {
      throw new VtbGoError('REFUND_NOT_FOUND', 'Запрос на возврат не найден.');
    }
    return refunds[0];
  }

  private record(sessionId: string, action: string, actor: DomainEvent['actor'], result: string): void {
    this.state.events.push({
      id: this.nextId('evt'),
      sessionId,
      action,
      actor,
      result,
      at: this.deps.now(),
    });
  }

  private nextId(prefix: string): string {
    this.state.seq += 1;
    return `${prefix}_${this.state.seq}`;
  }

  private cloneSession(session: Session): Session {
    return JSON.parse(JSON.stringify(session)) as Session;
  }

  private cloneCart(cart: Cart): Cart {
    return JSON.parse(JSON.stringify(cart)) as Cart;
  }

  private clonePayment(payment: Payment): Payment {
    return { ...payment };
  }
}
