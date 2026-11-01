import { create } from 'zustand';

import type { CatalogPreset, PaymentSimMode, ReceiptSimMode, SimulatorConfig } from '@/domain/types';

interface DemoState extends SimulatorConfig {
  catalogMode: CatalogPreset;
  setPaymentMode: (paymentMode: PaymentSimMode) => void;
  setReceiptMode: (receiptMode: ReceiptSimMode) => void;
  setCatalogMode: (catalogMode: CatalogPreset) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  paymentMode: 'success',
  receiptMode: 'immediate',
  catalogMode: 'basic',
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  setReceiptMode: (receiptMode) => set({ receiptMode }),
  setCatalogMode: (catalogMode) => set({ catalogMode }),
}));

export function getSimulatorConfig(): SimulatorConfig {
  const { paymentMode, receiptMode } = useDemoStore.getState();
  return { paymentMode, receiptMode };
}
