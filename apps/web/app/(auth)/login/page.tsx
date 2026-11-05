import type { Metadata } from 'next';
import { AuthCard } from '../../../components/modules/auth/auth-card';
import { LoginForm } from '../../../components/modules/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In | LLM Gateway',
  description: 'Sign in to access your LLM Gateway projects and API keys',
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your LLM Gateway developer workspace"
      footerPrompt="Don't have an account yet?"
      footerLinkText="Create an account"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthCard>
  );
}

