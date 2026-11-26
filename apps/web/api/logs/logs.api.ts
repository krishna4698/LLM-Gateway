import { apiClient } from '../client';
import type { LogsResponse } from '../../lib/types';

export interface GetLogsParams {
  projectId: number;
  limit?: number;
  offset?: number;
  status?: string;
  provider?: string;
}

export const logsApi = {
  getLogs: async ({ projectId, limit = 25, offset = 0, status, provider }: GetLogsParams): Promise<LogsResponse> => {
    const params: Record<string, string | number> = { projectId, limit, offset };
    if (status) params.status = status;
    if (provider) params.provider = provider;

    const { data } = await apiClient.get<LogsResponse>('/logs', { params });
    return data;
  },
};
