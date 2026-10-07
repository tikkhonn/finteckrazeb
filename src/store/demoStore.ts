import { create } from 'zustand';

import type { PaymentSimMode, ReceiptSimMode, SimulatorConfig } from '@/domain/types';

interface DemoState extends SimulatorConfig {
  setPaymentMode: (paymentMode: PaymentSimMode) => void;
  setReceiptMode: (receiptMode: ReceiptSimMode) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  paymentMode: 'success',
  receiptMode: 'immediate',
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  setReceiptMode: (receiptMode) => set({ receiptMode }),
}));

export function getSimulatorConfig(): SimulatorConfig {
  const { paymentMode, receiptMode } = useDemoStore.getState();
  return { paymentMode, receiptMode };
}
