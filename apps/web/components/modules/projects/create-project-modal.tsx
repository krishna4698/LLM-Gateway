'use client';

import * as React from 'react';
import { Modal } from '../../ui/modal';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    onCreateProject(name.trim());
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Projects allow you to isolate API keys, spend limits, and rate limits for different applications."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Project Name"
          placeholder="e.g. Customer Support Bot"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-zinc-800/80">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

