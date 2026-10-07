import { create } from 'zustand';

import type { Cart } from '@/domain/types';

interface UiState {
  activeSessionId: string | null;
  checkoutSnapshot: Cart | null;
  acknowledgedVersion: number | null;
  setActiveSession: (id: string | null) => void;
  setCheckoutSnapshot: (cart: Cart | null) => void;
  setAcknowledgedVersion: (version: number | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeSessionId: null,
  checkoutSnapshot: null,
  acknowledgedVersion: null,
  setActiveSession: (activeSessionId) => set({ activeSessionId }),
  setCheckoutSnapshot: (checkoutSnapshot) => set({ checkoutSnapshot }),
  setAcknowledgedVersion: (acknowledgedVersion) => set({ acknowledgedVersion }),
}));
