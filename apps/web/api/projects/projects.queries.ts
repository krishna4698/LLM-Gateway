import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './projects.api';
import { useAppSelector } from '../../store/hooks';

export const PROJECTS_KEYS = {
  all: ['projects'] as const,
};

export function useProjectsQuery() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: PROJECTS_KEYS.all,
    queryFn: () => projectsApi.getProjects(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => projectsApi.createProject(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEYS.all });
    },
  });
}

