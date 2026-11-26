import { useQuery } from '@tanstack/react-query';
import { logsApi, type GetLogsParams } from './logs.api';

export const LOGS_QUERY = {
  all: ['logs'] as const,
  list: (params: Omit<GetLogsParams, 'projectId'> & { projectId: number }) =>
    ['logs', params.projectId, params.limit ?? 25, params.offset ?? 0, params.status ?? '', params.provider ?? ''] as const,
};

export function useLogsQuery(
  projectId: number | undefined | null,
  filters?: Omit<GetLogsParams, 'projectId'>
) {
  const limit = filters?.limit ?? 25;
  const offset = filters?.offset ?? 0;
  const status = filters?.status;
  const provider = filters?.provider;

  return useQuery({
    queryKey: LOGS_QUERY.list({
      projectId: projectId || 0,
      limit,
      offset,
      ...(status ? { status } : {}),
      ...(provider ? { provider } : {}),
    }),
    queryFn: () =>
      logsApi.getLogs({
        projectId: projectId!,
        limit,
        offset,
        ...(status ? { status } : {}),
        ...(provider ? { provider } : {}),
      }),
    enabled: Boolean(projectId),
    staleTime: 15 * 1000,
  });
}
