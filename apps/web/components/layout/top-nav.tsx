'use client';

import * as React from 'react';
import { Layers, Terminal, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ProjectSwitcher } from './project-switcher';
import type { Project } from '../../lib/types';

interface TopNavProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (id: number) => void;
  onCreateProjectClick: () => void;
}

export function TopNav({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProjectClick,
}: TopNavProps) {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shadow-sm">
            <Layers className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            LLM Gateway
          </span>
        </div>

        <div className="w-[1px] h-4 bg-zinc-800" />

        {/* Project Selector */}
        <ProjectSwitcher
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
          onCreateProjectClick={onCreateProjectClick}
        />
      </div>

      {/* Right side indicators */}
      <div className="flex items-center gap-3">
        <Badge variant="live">Gateway Active</Badge>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1 rounded-md font-mono">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span>http://localhost:3001</span>
        </div>
      </div>
    </header>
  );
}

