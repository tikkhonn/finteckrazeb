import type { PayRequest, VtbGoApi } from '@/api/contract';
import type { CartActor, CatalogItem, DomainEvent, Refund, Store } from '@/domain/types';
import { MockEngine } from '@/api/mock/engine';
import { emptyState } from '@/api/mock/state';
import { clearState, loadState, saveState } from '@/api/mock/storage';
import { getSimulatorConfig } from '@/store/demoStore';

export class MockApi implements VtbGoApi {
  private engine = MockEngine.create({
    now: () => Date.now(),
    getSim: getSimulatorConfig,
  });

  async hydrate(): Promise<void> {
    this.engine.state = await loadState();
  }

  private async persist(): Promise<void> {
    await saveState(this.engine.state);
  }

  async getStore(storeQr: string) {
    return this.engine.getStore(storeQr);
  }

  async startSession(storeId: string) {
    const session = this.engine.startSession(storeId);
    await this.persist();
    return session;
  }

  async getSession(sessionId: string) {
    const session = this.engine.getSession(sessionId);
    await this.persist();
    return session;
  }

  async addItem(sessionId: string, barcode: string) {
    return this.addItemAs(sessionId, barcode, 'customer');
  }

  async addItemAs(sessionId: string, barcode: string, actor: CartActor) {
    const cart = this.engine.addItem(sessionId, barcode, actor);
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
      return payment;
    } catch (error) {
      await this.persist();
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    const payment = this.engine.getPayment(paymentId);
    await this.persist();
    return payment;
  }

  async listPurchases() {
    const list = this.engine.listPurchases();
    await this.persist();
    return list;
  }

  async getPurchase(sessionId: string) {
    const purchase = this.engine.getPurchase(sessionId);
    await this.persist();
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
    return refund;
  }

  getCatalog(): CatalogItem[] {
    return this.engine.getCatalog();
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
