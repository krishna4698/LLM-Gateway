'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation, useLoginMutation } from '../../../api/auth/auth.queries';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          setSuccessMessage('Account created successfully! Logging you in...');
          // Seamless auto-login
          loginMutation.mutate(
            { email, password },
            {
              onSuccess: () => {
                router.push('/');
              },
              onError: () => {
                router.push('/login');
              },
            }
          );
        },
        onError: (err: unknown) => {
          const apiError =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            (err as Error)?.message ||
            'Failed to create account. Please try again.';
          setErrorMessage(apiError);
        },
      }
    );
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div>
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div>
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="relative">
        <Input
          label="Password (min. 6 characters)"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-200 focus:outline-none transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div>
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2 justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Creating Workspace Account...
          </>
        ) : (
          'Create Workspace Account'
        )}
      </Button>
    </form>
  );
}

