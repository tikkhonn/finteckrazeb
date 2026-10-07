import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApi } from '@/api/apiProvider';
import type { PayRequest } from '@/api/contract';
import { queryKeys } from './keys';

const api = getApi();

export function useSession(sessionId: string | undefined, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: queryKeys.session(sessionId ?? ''),
    queryFn: () => api.getSession(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: options?.poll ? 2000 : false,
  });
}

export function usePayment(paymentId: string | undefined, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: queryKeys.payment(paymentId ?? ''),
    queryFn: () => api.getPayment(paymentId!),
    enabled: Boolean(paymentId),
    refetchInterval: options?.poll ? 1500 : false,
  });
}

export function usePurchases() {
  return useQuery({
    queryKey: queryKeys.purchases,
    queryFn: () => api.listPurchases(),
  });
}

export function usePurchase(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.purchase(sessionId ?? ''),
    queryFn: () => api.getPurchase(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: 2000,
  });
}

export function useStartSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) => api.startSession(storeId),
    onSuccess: (session) => {
      client.setQueryData(queryKeys.session(session.id), session);
    },
  });
}

export function useAddItem(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (barcode: string) => api.addItem(sessionId, barcode),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
    },
  });
}

export function useUpdateQty(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
      api.updateQty(sessionId, itemId, qty),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
    },
  });
}

export function useFinalizeCart(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.finalizeCart(sessionId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
    },
  });
}

export function useCancelSession(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.cancelSession(sessionId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
      await client.invalidateQueries({ queryKey: queryKeys.purchases });
    },
  });
}

export function usePay(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (req: PayRequest) => api.pay(sessionId, req),
    onSuccess: async (payment) => {
      client.setQueryData(queryKeys.payment(payment.id), payment);
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
    },
    onError: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
    },
  });
}

export function useRequestRefund(sessionId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.requestRefund(sessionId, itemId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.purchase(sessionId) });
      await client.invalidateQueries({ queryKey: queryKeys.purchases });
    },
  });
}
