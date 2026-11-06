import { apiClient } from '../client';
import type { Project } from '../../lib/types';

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<{ data: Project[] }>('/projects');
    return data.data;
  },

  createProject: async (name: string): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', { name });
    return data;
  },
};

