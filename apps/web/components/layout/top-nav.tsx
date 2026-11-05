'use client';

import * as React from 'react';
import Link from 'next/link';
import { Layers, Terminal, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ProjectSwitcher } from './project-switcher';
import type { Project } from '../../lib/types';
import { useAppSelector } from '../../store/hooks';
import { useLogoutMutation } from '../../api/auth/auth.queries';

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
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogoutMutation();

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shadow-sm">
            <Layers className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            LLM Gateway
          </span>
        </Link>

        <div className="w-[1px] h-4 bg-zinc-800" />

        {/* Project Selector */}
        <ProjectSwitcher
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
          onCreateProjectClick={onCreateProjectClick}
        />
      </div>

      {/* Right side indicators & Auth */}
      <div className="flex items-center gap-3">
        <Badge variant="live">Gateway Active</Badge>

        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1 rounded-md font-mono">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span>http://localhost:3001</span>
        </div>

        {isInitialized && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-zinc-200 leading-none">
                    {user.name || user.email}
                  </span>
                  <span className="text-[11px] text-zinc-400 leading-tight">
                    ${(user.creditsUsd ?? 5).toFixed(2)} credits
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  title="Sign out"
                  className="px-2 text-zinc-400 hover:text-zinc-100"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
