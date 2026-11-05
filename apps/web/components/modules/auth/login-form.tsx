'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '../../../api/auth/auth.queries';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (err: unknown) => {
          const apiError =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            (err as Error)?.message ||
            'Failed to sign in. Please verify your credentials.';
          setErrorMessage(apiError);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

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
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
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

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2 justify-center"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Authenticating...
          </>
        ) : (
          'Sign In to Gateway'
        )}
      </Button>
    </form>
  );
}

