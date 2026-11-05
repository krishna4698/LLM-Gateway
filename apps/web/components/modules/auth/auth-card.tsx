'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-zinc-800/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm mb-4">
            <Cpu className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-medium tracking-wide text-zinc-300 uppercase">
              LLM Gateway
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
        </div>

        {/* Card container */}
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {children}

          {/* Footer switch prompt */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              {footerPrompt}{' '}
              <Link
                href={footerLinkHref}
                className="font-medium text-zinc-200 hover:text-white underline underline-offset-4 transition-colors"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Encrypted with SHA-256 and rotating session tokens</span>
        </div>
      </div>
    </div>
  );
}

