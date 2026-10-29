'use client';

import * as React from 'react';
import { ChevronDown, Folder, Plus, Check } from 'lucide-react';
import type { Project } from '../../lib/types';

interface ProjectSwitcherProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (projectId: number) => void;
  onCreateProjectClick: () => void;
}

export function ProjectSwitcher({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProjectClick,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 text-sm font-medium text-zinc-200 transition-colors"
      >
        <Folder className="w-4 h-4 text-zinc-400" />
        <span className="truncate max-w-[160px]">{selectedProject.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-60 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Projects
          </div>
          <div className="max-h-56 overflow-y-auto">
            {projects.map((proj) => {
              const isSelected = proj.id === selectedProject.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    isSelected ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-300 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="truncate">{proj.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-800/80 mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateProjectClick();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

