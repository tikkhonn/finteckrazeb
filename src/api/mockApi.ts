import type { AddItemInput, PayRequest, VtbGoApi } from '@/api/contract';
import type { CartActor, CatalogItem, CatalogPreset, DomainEvent, Refund, Store } from '@/domain/types';
import { parseCatalogItems } from '@/domain/catalog/parseCatalog';
import { isVtbGoError } from '@/domain/errors';
import { isHttpUrl, parseScannedCode } from '@/domain/scanner/barcodeParser';
import { clearCatalog, loadCatalog, saveCatalog } from '@/api/mock/catalogStore';
import { MockEngine, seedCatalog } from '@/api/mock/engine';
import { findStoreById, findStoreByQr } from '@/api/mock/stores';
import { emptyState } from '@/api/mock/state';
import { clearState, loadState, saveState } from '@/api/mock/storage';
import { getSimulatorConfig, useDemoStore } from '@/store/demoStore';
import { resolveProfile } from '@/domain/profile';
import { useProfileStore } from '@/store/profileStore';
import { useUiStore } from '@/store/uiStore';

export class MockApi implements VtbGoApi {
  private engine = MockEngine.create({
    now: () => Date.now(),
    getSim: getSimulatorConfig,
    isAdultVerified: () => resolveProfile(useProfileStore.getState()).isAdultVerified,
  });

  private catalogNotice: string | null = null;

  async hydrate(): Promise<void> {
    const [state, catalog] = await Promise.all([loadState(), loadCatalog()]);
    this.engine.state = state;
    if (catalog && catalog.length > 0) {
      this.engine.catalog = catalog;
      this.engine.markCustomCatalog();
    } else {
      this.engine.catalog = seedCatalog();
    }
  }

  takeCatalogNotice(): string | null {
    const notice = this.catalogNotice;
    this.catalogNotice = null;
    return notice;
  }

  private async persist(): Promise<void> {
    await saveState(this.engine.state);
  }

  private syncCardLedger(sessionId?: string): void {
    const ids = sessionId ? [sessionId] : Object.keys(this.engine.state.sessions);
    const store = useProfileStore.getState();
    for (const id of ids) {
      const session = this.engine.state.sessions[id];
      if (!session?.paymentId) continue;
      const payment = this.engine.state.payments[session.paymentId];
      if (payment?.status === 'succeeded') {
        store.debitPayment(payment.id, payment.amount);
      }
      for (const refund of Object.values(this.engine.state.refunds)) {
        if (refund.sessionId === id && refund.status === 'completed') {
          store.creditRefund(refund.id, refund.amount);
        }
      }
    }
  }

  async getStore(storeQr: string) {
    const focusSessionId = useUiStore.getState().activeSessionId;
    const parsed = parseScannedCode(storeQr);
    if (parsed.type === 'catalog_url') {
      const loaded = await this.loadCatalogFromUrl(parsed.url, focusSessionId);
      if (loaded === 'fallback') {
        this.catalogNotice =
          'Не удалось загрузить каталог по ссылке. Открыта полная база из 50 товаров.';
      }
      return this.engine.getStore(storeQrFromCatalogKey(parsed.storeKey), focusSessionId);
    }
    const store = this.engine.getStore(storeQr, focusSessionId);
    if (parsed.type === 'catalog_qr') {
      useDemoStore.getState().setCatalogMode('full');
    }
    return store;
  }

  async setCatalogPreset(preset: CatalogPreset): Promise<void> {
    const focusSessionId = useUiStore.getState().activeSessionId;
    this.engine.useCatalog(preset, focusSessionId);
    if (preset === 'basic') {
      const saved = await loadCatalog();
      if (saved && saved.length > 0) {
        this.engine.catalog = saved;
        this.engine.markCustomCatalog();
      }
    }
    useDemoStore.getState().setCatalogMode(preset);
  }

  private async loadCatalogFromUrl(
    url: string,
    focusSessionId?: string | null,
  ): Promise<'remote' | 'fallback'> {
    if (!isHttpUrl(url)) {
      this.engine.useCatalog('full', focusSessionId);
      useDemoStore.getState().setCatalogMode('full');
      return 'fallback';
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      const items = parseCatalogItems(await response.json());
      this.engine.importCatalog(items, focusSessionId);
      useDemoStore.getState().setCatalogMode('full');
      return 'remote';
    } catch (error) {
      if (isVtbGoError(error) && error.code === 'CATALOG_SWITCH_BLOCKED') {
        throw error;
      }
      this.engine.useCatalog('full', focusSessionId);
      useDemoStore.getState().setCatalogMode('full');
      return 'fallback';
    }
  }

  async startSession(storeId: string) {
    const session = this.engine.startSession(storeId);
    await this.persist();
    return session;
  }

  async getSession(sessionId: string) {
    const session = this.engine.getSession(sessionId);
    await this.persist();
    this.syncCardLedger(sessionId);
    return session;
  }

  async addItem(sessionId: string, input: AddItemInput) {
    return this.addItemAs(sessionId, input, 'customer');
  }

  async addItemAs(sessionId: string, input: AddItemInput, actor: CartActor) {
    const raw = typeof input === 'string' ? input : input.raw;
    const exciseCode = typeof input === 'string' ? undefined : input.exciseCode;
    const cart = this.engine.addItem(sessionId, raw, actor, exciseCode ? { exciseCode } : undefined);
    await this.persist();
    return cart;
  }

  async updateQty(sessionId: string, itemId: string, qty: number) {
    const cart = this.engine.updateQty(sessionId, itemId, qty);
    await this.persist();
    return cart;
  }

  async finalizeCart(sessionId: string) {
    const cart = this.engine.finalizeCart(sessionId);
    await this.persist();
    return cart;
  }

  async cancelSession(sessionId: string) {
    const session = this.engine.cancelSession(sessionId);
    await this.persist();
    return session;
  }

  async pay(sessionId: string, req: PayRequest) {
    try {
      const payment = this.engine.pay(sessionId, req);
      await this.persist();
      this.syncCardLedger(sessionId);
      return payment;
    } catch (error) {
      await this.persist();
      this.syncCardLedger(sessionId);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    const payment = this.engine.getPayment(paymentId);
    await this.persist();
    this.syncCardLedger(payment.sessionId);
    return payment;
  }

  async listPurchases() {
    const list = this.engine.listPurchases();
    await this.persist();
    this.syncCardLedger();
    return list;
  }

  async getPurchase(sessionId: string) {
    const purchase = this.engine.getPurchase(sessionId);
    await this.persist();
    this.syncCardLedger(sessionId);
    return purchase;
  }

  async requestRefund(sessionId: string, itemId: string) {
    const refund = this.engine.requestRefund(sessionId, itemId);
    await this.persist();
    return refund;
  }

  async cashierAddItem(sessionId: string, barcode: string) {
    return this.addItemAs(sessionId, barcode, 'cashier');
  }

  async approveRefund(sessionId: string): Promise<Refund> {
    const refund = this.engine.approveRefund(sessionId);
    await this.persist();
    return refund;
  }

  async completeRefund(sessionId: string): Promise<Refund> {
    const refund = this.engine.completeRefund(sessionId);
    await this.persist();
    this.syncCardLedger(sessionId);
    return refund;
  }

  getCatalog(): CatalogItem[] {
    return this.engine.getCatalog();
  }

  async upsertCatalogItem(item: CatalogItem): Promise<CatalogItem> {
    const saved = this.engine.upsertCatalogItem(item);
    if (useDemoStore.getState().catalogMode !== 'full') {
      await saveCatalog(this.engine.catalog);
    }
    return saved;
  }

  async deleteCatalogItem(barcode: string): Promise<void> {
    this.engine.deleteCatalogItem(barcode);
    if (useDemoStore.getState().catalogMode !== 'full') {
      await saveCatalog(this.engine.catalog);
    }
  }

  async resetCatalog(): Promise<void> {
    this.engine.resetCatalogToSeed();
    await clearCatalog();
    useDemoStore.getState().setCatalogMode('basic');
  }

  listStores(): Store[] {
    return this.engine.listStores();
  }

  listEvents(sessionId?: string): DomainEvent[] {
    return this.engine.listEvents(sessionId);
  }

  async reset(): Promise<void> {
    this.engine.state = emptyState();
    await clearState();
  }
}

function storeQrFromCatalogKey(key: string): string {
  if (!key || key === 'CUSTOM') {
    return 'VTBGO-STORE-UDOMA';
  }
  return findStoreById(key)?.qr ?? findStoreByQr(key)?.qr ?? 'VTBGO-STORE-UDOMA';
}
