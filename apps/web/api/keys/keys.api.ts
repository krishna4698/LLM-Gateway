import { apiClient } from '../client';
import type { GatewayKey, GeneratedKeyResult } from '../../lib/types';

export interface CreateKeyPayload {
  name: string;
  projectId: number;
  rateLimitRpm: number;
  monthlyCapUsd?: number | null;
}

export const keysApi = {
  getKeys: async (projectId: number): Promise<GatewayKey[]> => {
    const { data } = await apiClient.get<{ data: GatewayKey[] }>(`/keys?projectId=${projectId}`);
    return data.data;
  },

  createKey: async (payload: CreateKeyPayload): Promise<GeneratedKeyResult> => {
    const { data } = await apiClient.post<GeneratedKeyResult>('/keys', payload);
    return data;
  },

  revokeKey: async (keyId: number): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/keys/${keyId}`);
    return data;
  },
};

