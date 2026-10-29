'use client';

import * as React from 'react';
import { Plus, KeyRound, BarChart3, Route, Sliders, Shield, Terminal } from 'lucide-react';
import { TopNav } from '../components/layout/top-nav';
import { Button } from '../components/ui/button';
import { EmptyKeysState } from '../components/modules/keys/empty-keys-state';
import { KeyTable } from '../components/modules/keys/key-table';
import { CreateKeyModal } from '../components/modules/keys/create-key-modal';
import { KeyRevealModal } from '../components/modules/keys/key-reveal-modal';
import { CreateProjectModal } from '../components/modules/projects/create-project-modal';
import { useGatewayStore } from '../hooks/use-gateway-store';
import type { GeneratedKeyResult } from '../lib/types';

export default function DashboardPage() {
  const {
    projects,
    selectedProject,
    setSelectedProjectId,
    keys,
    createKey,
    revokeKey,
    createProject,
  } = useGatewayStore();

  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = React.useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false);
  const [revealedKeyData, setRevealedKeyData] = React.useState<GeneratedKeyResult | null>(null);

  const handleCreateKey = (params: {
    name: string;
    rateLimitRpm: number;
    monthlyCapUsd?: number | null;
  }) => {
    const result = createKey(params);
    setRevealedKeyData(result);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Navigation */}
      <TopNav
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProjectId}
        onCreateProjectClick={() => setIsCreateProjectModalOpen(true)}
      />

      {/* Page Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-6 pt-7 pb-0">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-1.5">
                <span>Projects</span>
                <span>/</span>
                <span className="text-zinc-400">{selectedProject.name}</span>
                <span>/</span>
                <span className="text-zinc-200">API Keys</span>
              </div>
              <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
                Gateway API Keys
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Issue and manage Bearer tokens for authenticating client applications through your proxy.
              </p>
            </div>

            <div>
              <Button onClick={() => setIsCreateKeyModalOpen(true)} size="sm">
                <Plus className="w-4 h-4" />
                <span>Create New Key</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-transparent">
            <button className="flex items-center gap-2 pb-3 border-b-2 border-white text-xs font-medium text-white transition-colors">
              <KeyRound className="w-3.5 h-3.5 text-zinc-200" />
              <span>API Keys</span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded-full font-mono text-zinc-400">
                {keys.length}
              </span>
            </button>

            <button
              disabled
              className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-xs font-medium text-zinc-500 hover:text-zinc-400 cursor-not-allowed opacity-60"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Usage & Logs</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-mono">Soon</span>
            </button>

            <button
              disabled
              className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-xs font-medium text-zinc-500 hover:text-zinc-400 cursor-not-allowed opacity-60"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Model Routing</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-mono">Soon</span>
            </button>

            <button
              disabled
              className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-xs font-medium text-zinc-500 hover:text-zinc-400 cursor-not-allowed opacity-60"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {/* Keys Panel */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/20">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Active Keys</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Keys scoped to <strong className="text-zinc-300 font-medium">{selectedProject.name}</strong>. Secret hashes are securely stored in SHA-256.
              </p>
            </div>
            {keys.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateKeyModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Key</span>
              </Button>
            )}
          </div>

          {/* Conditional Empty State or Table */}
          {keys.length === 0 ? (
            <EmptyKeysState
              projectName={selectedProject.name}
              onCreateKeyClick={() => setIsCreateKeyModalOpen(true)}
            />
          ) : (
            <KeyTable keys={keys} onRevokeKey={revokeKey} />
          )}
        </div>

        {/* Security & Quick Start Guide Footnote */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <Shield className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200">SHA-256 Key Hashing</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Raw secrets (<code className="text-zinc-400 font-mono">gw_live_...</code>) are never stored in the database in plaintext. If a key is revoked, requests are blocked immediately with 401 Unauthorized.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <Terminal className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200">Quick Integration</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Connect using the official OpenAI SDK with <code className="text-zinc-400 font-mono">baseURL: http://localhost:3001/v1</code> and pass your gateway key as the Bearer token.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateKeyModal
        isOpen={isCreateKeyModalOpen}
        onClose={() => setIsCreateKeyModalOpen(false)}
        projectName={selectedProject.name}
        onCreateKey={handleCreateKey}
      />

      <KeyRevealModal
        keyData={revealedKeyData}
        onClose={() => setRevealedKeyData(null)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={createProject}
      />
    </div>
  );
}
