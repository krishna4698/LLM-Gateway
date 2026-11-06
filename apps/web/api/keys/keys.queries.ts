import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keysApi, type CreateKeyPayload } from './keys.api';

export const KEYS_QUERY = {
  all: ['keys'] as const,
  byProject: (projectId: number) => ['keys', projectId] as const,
};

export function useKeysQuery(projectId: number | undefined | null) {
  return useQuery({
    queryKey: KEYS_QUERY.byProject(projectId || 0),
    queryFn: () => keysApi.getKeys(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
}

export function useCreateKeyMutation(projectId: number | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateKeyPayload) => keysApi.createKey(payload),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: KEYS_QUERY.byProject(projectId) });
      }
    },
  });
}

export function useRevokeKeyMutation(projectId: number | undefined | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: number) => keysApi.revokeKey(keyId),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: KEYS_QUERY.byProject(projectId) });
      }
    },
  });
}

