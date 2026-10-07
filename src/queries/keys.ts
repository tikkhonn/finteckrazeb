export const queryKeys = {
  session: (id: string) => ['session', id] as const,
  payment: (id: string) => ['payment', id] as const,
  purchases: ['purchases'] as const,
  purchase: (id: string) => ['purchase', id] as const,
};
