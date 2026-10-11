import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  addExtraDocument,
  applyCashOp,
  applyCompletedRefund,
  applySucceededPayment,
  emptyOverlays,
  parseOverlays,
  pickOverlays,
  resolveProfile,
  setAvatarUri,
  switchActive,
  type CashKind,
  type CashOp,
  type DocumentType,
  type ProfileId,
  type ProfileOverlays,
  type ResolvedProfile,
} from '@/domain/profile';

const STORAGE_KEY = 'vtbgo.profile.v1';

interface ProfileState extends ProfileOverlays {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  switchProfile: (id: ProfileId) => void;
  setAvatar: (uri: string) => void;
  addDocument: (type: DocumentType) => boolean;
  applyCash: (kind: CashKind, amount: number, qr: string) => CashOp;
  debitPayment: (paymentId: string, amount: number) => void;
  creditRefund: (refundId: string, amount: number) => void;
}

async function loadOverlays(): Promise<ProfileOverlays> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyOverlays();
  try {
    return parseOverlays(JSON.parse(raw) as unknown);
  } catch {
    return emptyOverlays();
  }
}

function persist(overlays: ProfileOverlays) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pickOverlays(overlays)));
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...emptyOverlays(),
  hydrated: false,
  hydrate: async () => {
    const loaded = await loadOverlays();
    set({ ...loaded, hydrated: true });
  },
  switchProfile: (id) => {
    const next = switchActive(pickOverlays(get()), id);
    persist(next);
    set(next);
  },
  setAvatar: (uri) => {
    const next = setAvatarUri(pickOverlays(get()), uri);
    persist(next);
    set(next);
  },
  addDocument: (type) => {
    try {
      const next = addExtraDocument(pickOverlays(get()), type);
      persist(next);
      set(next);
      return true;
    } catch {
      return false;
    }
  },
  applyCash: (kind, amount, qr) => {
    const { overlays, op } = applyCashOp(pickOverlays(get()), { kind, amount, qr });
    persist(overlays);
    set(overlays);
    return op;
  },
  debitPayment: (paymentId, amount) => {
    const next = applySucceededPayment(pickOverlays(get()), paymentId, amount);
    persist(next);
    set(next);
  },
  creditRefund: (refundId, amount) => {
    const next = applyCompletedRefund(pickOverlays(get()), refundId, amount);
    persist(next);
    set(next);
  },
}));

export async function hydrateProfile(): Promise<void> {
  await useProfileStore.getState().hydrate();
}

export function useActiveProfile(): ResolvedProfile {
  const activeId = useProfileStore((s) => s.activeId);
  const avatarById = useProfileStore((s) => s.avatarById);
  const extraDocsById = useProfileStore((s) => s.extraDocsById);
  const balanceById = useProfileStore((s) => s.balanceById);
  const cashOpsById = useProfileStore((s) => s.cashOpsById);
  const appliedPayments = useProfileStore((s) => s.appliedPayments);
  const appliedRefunds = useProfileStore((s) => s.appliedRefunds);
  return resolveProfile({
    activeId,
    avatarById,
    extraDocsById,
    balanceById,
    cashOpsById,
    appliedPayments,
    appliedRefunds,
  });
}
