'use client';

import * as React from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface EmptyKeysStateProps {
  projectName: string;
  onCreateKeyClick: () => void;
}

export function EmptyKeysState({ projectName, onCreateKeyClick }: EmptyKeysStateProps) {
  return (
    <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-sm">
        <KeyRound className="w-5 h-5 text-zinc-300" />
      </div>
      <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
        No API keys found for {projectName}
      </h3>
      <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-6">
        Generate a Gateway API Key to authenticate requests with the OpenAI-compatible proxy (`/v1/chat/completions`).
      </p>
      <Button onClick={onCreateKeyClick} size="sm">
        <Plus className="w-4 h-4" />
        <span>Generate New Key</span>
      </Button>
    </div>
  );
}

