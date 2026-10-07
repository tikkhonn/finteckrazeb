import type { VtbGoApi } from '@/api/contract';
import { HttpApi } from '@/api/httpApi';
import { MockApi } from '@/api/mockApi';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const mockApi = new MockApi();
export const isMockApi = !API_URL;

export function getApi(): VtbGoApi {
  if (API_URL) {
    return new HttpApi(API_URL.replace(/\/$/, ''));
  }
  return mockApi;
}

export function getMockApi(): MockApi | null {
  return isMockApi ? mockApi : null;
}
