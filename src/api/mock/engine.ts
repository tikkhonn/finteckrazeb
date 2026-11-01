import catalogData from './catalog.json';
import products50 from './products50.json';
import { parseCatalogItems } from '@/domain/catalog/parseCatalog';
import { basketCashback, lineAmount, withLineCashback, withTotals } from '@/domain/cart';
import { assertEan13 } from '@/domain/ean';
import { VtbGoError } from '@/domain/errors';
import { exitPassExpiresAt, exitPassToken } from '@/domain/exitPass';
import { parseScannedCode, type ParsedCode } from '@/domain/scanner/barcodeParser';
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

const AGE_MESSAGE =
  'Ограничение 18+. По данным профиля ВТБ вам еще не исполнилось 18 лет. Покупка энергетических и подакцизных напитков недоступна';
const EXCISE_MESSAGE =
  'Товар подлежит обязательной маркировке. Наведите камеру на QR / DataMatrix на крышке или этикетке';
const DUPLICATE_MARK_MESSAGE = 'Эта бутылка уже в корзине. Отсканируйте марку другой бутылки';

export interface EngineDeps {
  now: () => number;
  getSim: () => SimulatorConfig;
  /** Нет функции — считаем покупателя совершеннолетним (старые тесты). */
  isAdultVerified?: () => boolean;
}

export interface AddItemExtras {
  exciseCode?: string;
}

export function seedCatalog(): CatalogItem[] {
  return SEED_CATALOG.map((item) => ({ ...item }));
}

export function fullCatalog(): CatalogItem[] {
  return parseCatalogItems(products50);
}

export class MockEngine {
  /** `custom` — правки на устройстве или каталог по URL. */
  private catalogPreset: 'basic' | 'full' | 'custom' = 'basic';

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
      barcode: input.isWeighted ? input.barcode.trim() : assertEan13(input.barcode),
      name,
      price: Math.round(input.price * 100) / 100,
      requiresExcise: input.requiresExcise === true ? true : undefined,
      isAdultOnly: input.isAdultOnly === true ? true : undefined,
      isWeighted: input.isWeighted === true ? true : undefined,
      pluCode: input.pluCode,
      cashbackRate: input.cashbackRate,
    };
    const index = this.catalog.findIndex((entry) => entry.barcode === item.barcode);
    if (index >= 0) {
      this.catalog[index] = item;
    } else {
      this.catalog.push(item);
    }
    this.catalogPreset = 'custom';
    return { ...item };
  }

  deleteCatalogItem(barcode: string): void {
    this.catalog = this.catalog.filter((item) => item.barcode !== barcode);
    this.catalogPreset = 'custom';
  }

  resetCatalogToSeed(): void {
    this.catalog = seedCatalog();
    this.catalogPreset = 'basic';
  }

  markCustomCatalog(): void {
    this.catalogPreset = 'custom';
  }

  useCatalog(preset: 'basic' | 'full', focusSessionId?: string | null): void {
    if (preset === 'full' && this.catalogPreset === 'full') {
      return;
    }
    this.assertCanSwitchCatalog(focusSessionId);
    this.catalog = preset === 'full' ? fullCatalog() : seedCatalog();
    this.catalogPreset = preset;
  }

  importCatalog(items: CatalogItem[], focusSessionId?: string | null): void {
    this.assertCanSwitchCatalog(focusSessionId);
    this.catalog = items.map((item) => ({ ...item }));
    this.catalogPreset = 'custom';
  }

  private assertCanSwitchCatalog(focusSessionId?: string | null): void {
    if (focusSessionId) {
      const session = this.state.sessions[focusSessionId];
      if (
        session &&
        EDITABLE_STATUSES.includes(session.status) &&
        session.cart.items.length > 0
      ) {
        throw new VtbGoError('CATALOG_SWITCH_BLOCKED', 'Сначала очистите корзину.');
      }
      return;
    }
    const blocked = Object.values(this.state.sessions).some(
      (session) => EDITABLE_STATUSES.includes(session.status) && session.cart.items.length > 0,
    );
    if (blocked) {
      throw new VtbGoError(
        'CATALOG_SWITCH_BLOCKED',
        'Сначала очистите корзину или отмените незавершённую покупку.',
      );
    }
  }

  private cancelOtherEditableSessions(): void {
    for (const session of Object.values(this.state.sessions)) {
      if (!EDITABLE_STATUSES.includes(session.status)) {
        continue;
      }
      this.transition(session, 'cancelled');
      this.record(session.id, 'cancel_session', 'system', 'Начата новая покупка в другом магазине');
    }
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

  getStore(storeQr: string, focusSessionId?: string | null): Store {
    const parsed = parseScannedCode(storeQr);
    if (parsed.type === 'catalog_qr') {
      this.useCatalog('full', focusSessionId);
      const store = findStoreByQr('VTBGO-STORE-UDOMA');
      if (!store) {
        throw new VtbGoError('STORE_NOT_FOUND', 'Магазин не найден. Отсканируйте QR торговой точки.');
      }
      return store;
    }
    if (parsed.type === 'catalog_url') {
      throw new VtbGoError('STORE_NOT_FOUND', 'Ссылка на каталог обрабатывается отдельно.');
    }
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
    this.cancelOtherEditableSessions();
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

  addItem(sessionId: string, raw: string, actor: CartActor = 'customer', extras?: AddItemExtras): Cart {
    this.tick(sessionId);
    const session = this.requireSession(sessionId);
    this.assertEditable(session);
    const eventActor = actor === 'cashier' ? 'store' : 'customer';

    const resolved = this.resolveScan(raw);
    if (resolved.type === 'store_qr' || resolved.type === 'catalog_qr' || resolved.type === 'catalog_url') {
      this.record(sessionId, 'invalid_barcode', eventActor, raw);
      throw new VtbGoError('INVALID_BARCODE', 'Это код магазина, а не товар.');
    }
    if (resolved.type === 'unknown') {
      this.record(sessionId, 'invalid_barcode', eventActor, raw);
      throw new VtbGoError('INVALID_BARCODE', 'Некорректный штрихкод. Нужен EAN-13.');
    }
    if (resolved.type === 'weighted' && resolved.weightKg <= 0) {
      this.record(sessionId, 'invalid_barcode', eventActor, raw);
      throw new VtbGoError('INVALID_BARCODE', 'Вес на этикетке не распознан.');
    }

    const product = this.findProduct(resolved);
    if (!product) {
      this.record(sessionId, 'item_not_found', eventActor, raw);
      throw new VtbGoError('ITEM_NOT_FOUND', 'Товар не найден. Обратитесь к сотруднику.');
    }

    if (product.isAdultOnly && !this.adultVerified()) {
      this.record(sessionId, 'age_restricted', eventActor, product.name);
      throw new VtbGoError('AGE_RESTRICTED_18_PLUS', AGE_MESSAGE);
    }

    const mark = resolved.type === 'gs1' ? resolved.exciseCode : extras?.exciseCode;
    if (product.requiresExcise && !mark) {
      this.record(sessionId, 'awaiting_excise', eventActor, product.name);
      throw new VtbGoError('AWAITING_EXCISE', EXCISE_MESSAGE, {
        barcode: product.barcode,
        name: product.name,
        isAdultOnly: product.isAdultOnly === true,
      });
    }

    const items = session.cart.items.map((item) => withLineCashback({ ...item, exciseCodes: item.exciseCodes ?? [] }));
    if (mark) {
      this.assertUniqueMark(items, mark);
    }

    if (product.isWeighted && resolved.type === 'weighted') {
      items.push(
        this.buildItem(product, actor, {
          id: `item_${product.pluCode}_${this.nextId('pkg')}`,
          barcode: resolved.ean13,
          qty: 1,
          weightKg: resolved.weightKg,
        }),
      );
    } else {
      const existing = items.find((item) => item.barcode === product.barcode && item.weightKg == null);
      if (existing && product.requiresExcise && mark) {
        existing.exciseCodes = [...existing.exciseCodes, mark];
        existing.qty = existing.exciseCodes.length;
        Object.assign(existing, withLineCashback(existing));
      } else if (existing) {
        existing.qty += 1;
        Object.assign(existing, withLineCashback(existing));
      } else {
        items.push(
          this.buildItem(product, actor, {
            id: `item_${product.barcode}`,
            barcode: product.barcode,
            qty: 1,
            exciseCodes: mark ? [mark] : [],
          }),
        );
      }
    }

    this.replaceCart(session, items);
    this.record(
      sessionId,
      actor === 'cashier' ? 'cashier_add_item' : 'add_item',
      eventActor,
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

    const current = session.cart.items.find((item) => item.id === itemId);
    if (!current) {
      throw new VtbGoError('ITEM_NOT_FOUND', 'Позиция не найдена в корзине.');
    }
    if (current.weightKg != null && qty !== 0 && qty !== current.qty) {
      throw new VtbGoError('INVALID_STATE', 'Весовой пакет нельзя изменить счётчиком. Удалите его и взвесьте ещё раз.');
    }
    const marks = current.exciseCodes ?? [];
    if (marks.length > 0 && qty > current.qty) {
      throw new VtbGoError('AWAITING_EXCISE', EXCISE_MESSAGE, {
        barcode: current.barcode,
        name: current.name,
        isAdultOnly: current.isAdultOnly === true,
      });
    }

    const items = session.cart.items.flatMap((entry) => {
      if (entry.id !== itemId) {
        return [withLineCashback({ ...entry, exciseCodes: entry.exciseCodes ?? [] })];
      }
      if (qty === 0) {
        return [];
      }
      const exciseCodes = marks.length > 0 ? marks.slice(0, qty) : (entry.exciseCodes ?? []);
      return [
        withLineCashback({
          ...entry,
          qty: marks.length > 0 ? exciseCodes.length : qty,
          exciseCodes,
        }),
      ];
    });

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
      amount: lineAmount(item),
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
    const now = this.deps.now();
    const receiptId = this.nextId('rcpt');
    const items = session.cart.items.map((item) => withLineCashback({ ...item, exciseCodes: item.exciseCodes ?? [] }));
    const receipt: Receipt = {
      id: receiptId,
      sessionId: session.id,
      paymentId: payment.id,
      fiscalMark: 'DEMO',
      number: `ДЕМО-${this.state.seq.toString().padStart(4, '0')}`,
      issuedAt: now,
      items,
      total: session.cart.total,
      exitPassToken: exitPassToken(receiptId, now),
      exitPassExpiresAt: exitPassExpiresAt(now),
      cashbackEarned: basketCashback(items, payment.method),
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

  private resolveScan(raw: string): ParsedCode {
    const parsed = parseScannedCode(raw);
    if (parsed.type !== 'unknown') {
      return parsed;
    }
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 13 && this.catalog.some((item) => item.barcode === digits)) {
      return { type: 'ean13', ean13: digits };
    }
    return { type: 'unknown' };
  }

  private findProduct(parsed: ParsedCode): CatalogItem | undefined {
    if (parsed.type === 'weighted') {
      return this.catalog.find((item) => item.pluCode === parsed.pluCode);
    }
    if (parsed.type === 'ean13' || parsed.type === 'gs1') {
      return this.catalog.find((item) => item.barcode === parsed.ean13);
    }
    return undefined;
  }

  private adultVerified(): boolean {
    return this.deps.isAdultVerified ? this.deps.isAdultVerified() : true;
  }

  private assertUniqueMark(items: CartItem[], mark: string): void {
    if (items.some((item) => (item.exciseCodes ?? []).includes(mark))) {
      throw new VtbGoError('DUPLICATE_EXCISE_CODE', DUPLICATE_MARK_MESSAGE);
    }
  }

  private buildItem(
    product: CatalogItem,
    actor: CartActor,
    input: { id: string; barcode: string; qty: number; weightKg?: number; exciseCodes?: string[] },
  ): CartItem {
    return withLineCashback({
      id: input.id,
      barcode: input.barcode,
      name: product.name,
      unitPrice: product.price,
      qty: input.qty,
      addedBy: actor,
      exciseCodes: input.exciseCodes ?? [],
      weightKg: input.weightKg,
      calculatedCashback: 0,
      cashbackRate: product.cashbackRate,
      isAdultOnly: product.isAdultOnly === true ? true : undefined,
    });
  }

  private cloneSession(session: Session): Session {
    const copy = JSON.parse(JSON.stringify(session)) as Session;
    copy.cart.items = copy.cart.items.map((item) => ({
      ...item,
      exciseCodes: item.exciseCodes ?? [],
      calculatedCashback: item.calculatedCashback ?? 0,
    }));
    return copy;
  }

  private cloneCart(cart: Cart): Cart {
    return JSON.parse(JSON.stringify(cart)) as Cart;
  }

  private clonePayment(payment: Payment): Payment {
    return { ...payment };
  }
}
