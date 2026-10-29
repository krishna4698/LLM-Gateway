'use client';

import * as React from 'react';
import { Modal } from '../../ui/modal';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onCreateKey: (params: {
    name: string;
    rateLimitRpm: number;
    monthlyCapUsd?: number | null;
  }) => void;
}

export function CreateKeyModal({
  isOpen,
  onClose,
  projectName,
  onCreateKey,
}: CreateKeyModalProps) {
  const [name, setName] = React.useState('');
  const [rateLimitRpm, setRateLimitRpm] = React.useState(60);
  const [monthlyCapUsd, setMonthlyCapUsd] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a descriptive key name.');
      return;
    }
    setError('');

    onCreateKey({
      name: name.trim(),
      rateLimitRpm: Number(rateLimitRpm),
      monthlyCapUsd: monthlyCapUsd ? Number(monthlyCapUsd) : null,
    });

    setName('');
    setMonthlyCapUsd('');
    setRateLimitRpm(60);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Gateway API Key"
      description={`This key will be scoped to project: ${projectName}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Key Name"
          placeholder="e.g. Production Web App"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-medium text-zinc-300">
            Rate Limit (Requests per minute)
          </label>
          <select
            value={rateLimitRpm}
            onChange={(e) => setRateLimitRpm(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value={30}>30 RPM (Strict / Free tier)</option>
            <option value={60}>60 RPM (Standard default)</option>
            <option value={120}>120 RPM (High throughput)</option>
            <option value={300}>300 RPM (Enterprise)</option>
          </select>
        </div>

        <Input
          label="Monthly Spend Cap ($ USD) — Optional"
          placeholder="e.g. 50.00"
          type="number"
          step="0.01"
          value={monthlyCapUsd}
          onChange={(e) => setMonthlyCapUsd(e.target.value)}
          hint="Leave empty for unlimited balance"
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-zinc-800/80">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Generate Key
          </Button>
        </div>
      </form>
    </Modal>
  );
}

