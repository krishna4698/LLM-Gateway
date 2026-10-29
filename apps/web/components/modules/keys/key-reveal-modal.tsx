'use client';

import * as React from 'react';
import { Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';
import type { GeneratedKeyResult } from '../../../lib/types';

interface KeyRevealModalProps {
  keyData: GeneratedKeyResult | null;
  onClose: () => void;
}

export function KeyRevealModal({ keyData, onClose }: KeyRevealModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!keyData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(keyData.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={Boolean(keyData)}
      onClose={onClose}
      title="Save Your API Key"
      description={keyData.name}
    >
      <div className="flex flex-col gap-4">
        {/* Warning callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Please save this secret key now. For security purposes, you will <strong>never</strong> be able to see it again. If you lose it, you will need to generate a new key.
          </span>
        </div>

        {/* Secret display box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Gateway Secret Key
          </label>
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-sky-400 selection:bg-sky-500/30 selection:text-sky-200">
            <span className="truncate select-all">{keyData.apiKey}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-end pt-4 mt-2 border-t border-zinc-800/80">
          <Button onClick={onClose} size="sm">
            <ShieldCheck className="w-4 h-4" />
            <span>I Have Saved My Secret Key</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
