import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginPayload, type RegisterPayload } from './auth.api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCredentials, logout as logoutAction } from '../../store/slices/auth.slice';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  me: () => [...AUTH_KEYS.all, 'me'] as const,
};

export function useLoginMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
        })
      );
      queryClient.setQueryData(AUTH_KEYS.me(), data.user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}

export function useLogoutMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      dispatch(logoutAction());
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

export function useMeQuery() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  return useQuery({
    queryKey: AUTH_KEYS.me(),
    queryFn: () => authApi.getMe(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

