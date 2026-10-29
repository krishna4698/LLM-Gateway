'use client';

import * as React from 'react';
import type { Project, GatewayKey, GeneratedKeyResult } from '../lib/types';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Default Project',
    slug: 'default-project',
    createdAt: new Date().toISOString(),
  },
];

export function useGatewayStore() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = React.useState<number>(1);
  const [keys, setKeys] = React.useState<GatewayKey[]>([]); // 👈 Zero dummy keys by default!

  const selectedProject = React.useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0]!,
    [projects, selectedProjectId]
  );

  const projectKeys = React.useMemo(
    () => keys.filter((k) => k.projectId === selectedProject.id),
    [keys, selectedProject.id]
  );

  // Generate a new key in local state (formatted exactly like the backend's gw_live_ format)
  const createKey = React.useCallback(
    (params: { name: string; rateLimitRpm: number; monthlyCapUsd?: number | null }): GeneratedKeyResult => {
      // 24 random hex characters for standard key length
      const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const rawKey = `gw_live_${randomHex}`;
      const prefix = rawKey.slice(0, 15);

      const newKeyRecord: GatewayKey = {
        id: Date.now(),
        name: params.name || 'API Key',
        prefix,
        projectId: selectedProject.id,
        rateLimitRpm: params.rateLimitRpm || 60,
        monthlyCapUsd: params.monthlyCapUsd || null,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setKeys((prev) => [newKeyRecord, ...prev]);

      return {
        id: newKeyRecord.id,
        name: newKeyRecord.name,
        prefix: newKeyRecord.prefix,
        apiKey: rawKey,
        rateLimitRpm: newKeyRecord.rateLimitRpm,
        status: newKeyRecord.status,
      };
    },
    [selectedProject.id]
  );

  const revokeKey = React.useCallback((keyId: number) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k))
    );
  }, []);

  const createProject = React.useCallback((name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newProj: Project = {
      id: Date.now(),
      name,
      slug,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProj]);
    setSelectedProjectId(newProj.id);
  }, []);

  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    keys: projectKeys,
    createKey,
    revokeKey,
    createProject,
  };
}

