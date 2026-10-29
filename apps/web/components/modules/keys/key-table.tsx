'use client';

import * as React from 'react';
import { Copy, Check, Ban } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import type { GatewayKey } from '../../../lib/types';

interface KeyTableProps {
  keys: GatewayKey[];
  onRevokeKey: (keyId: number) => void;
}

export function KeyTable({ keys, onRevokeKey }: KeyTableProps) {
  const [copiedPrefixId, setCopiedPrefixId] = React.useState<number | null>(null);

  const handleCopyPrefix = (key: GatewayKey) => {
    navigator.clipboard.writeText(key.prefix);
    setCopiedPrefixId(key.id);
    setTimeout(() => setCopiedPrefixId(null), 2000);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <th className="py-3 px-5">Name</th>
            <th className="py-3 px-5">Key Identifier</th>
            <th className="py-3 px-5">Rate Limit</th>
            <th className="py-3 px-5">Status</th>
            <th className="py-3 px-5">Created</th>
            <th className="py-3 px-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {keys.map((key) => {
            const isCopied = copiedPrefixId === key.id;
            const isRevoked = key.status === 'revoked';

            return (
              <tr
                key={key.id}
                className="hover:bg-zinc-900/30 transition-colors group"
              >
                {/* Name */}
                <td className="py-3.5 px-5 font-medium text-zinc-100">
                  {key.name}
                </td>

                {/* Prefix */}
                <td className="py-3.5 px-5">
                  <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-md font-mono text-[11px] text-zinc-300">
                    <span>{key.prefix}...</span>
                    <button
                      onClick={() => handleCopyPrefix(key)}
                      title="Copy Prefix"
                      className="text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Rate Limit */}
                <td className="py-3.5 px-5 text-zinc-300 font-mono">
                  {key.rateLimitRpm} RPM
                </td>

                {/* Status */}
                <td className="py-3.5 px-5">
                  <Badge variant={key.status === 'active' ? 'active' : 'revoked'}>
                    {key.status === 'active' ? 'Active' : 'Revoked'}
                  </Badge>
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-5 text-zinc-400">
                  {new Date(key.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  {!isRevoked ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRevokeKey(key.id)}
                    >
                      <Ban className="w-3 h-3" />
                      <span>Revoke</span>
                    </Button>
                  ) : (
                    <span className="text-zinc-600 text-xs italic">Revoked</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
