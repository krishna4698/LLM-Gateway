import type { Metadata } from 'next';
import { AuthCard } from '../../../components/modules/auth/auth-card';
import { RegisterForm } from '../../../components/modules/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account | LLM Gateway',
  description: 'Create an account to start routing and monitoring your LLM workloads',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create workspace account"
      subtitle="Start generating keys, monitoring costs, and routing models"
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}

