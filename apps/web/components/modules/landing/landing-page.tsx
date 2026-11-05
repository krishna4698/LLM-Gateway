'use client';

import * as React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, ShieldCheck, Zap, Activity, Cpu, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';

export function LandingPage() {
  const [copied, setCopied] = React.useState(false);

  const codeSnippet = `from openai import OpenAI

# Just point base_url to your LLM Gateway
client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="gw_live_your_gateway_key"
)

# Seamless routing to smart-chat or fast-chat with auto-failover
response = client.chat.completions.create(
    model="smart-chat",
    messages=[{"role": "user", "content": "Explain consensus algorithms"}],
    stream=True
)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Navigation */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shadow-sm">
            <Layers className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            LLM Gateway
          </span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            OpenAI Compatible
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 shadow-sm mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Production AI Infrastructure & Virtual Routing</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 max-w-3xl leading-[1.15]">
          Unified Routing, Failover & Telemetry for LLMs
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          A high-performance proxy with automated provider failover, real-time streaming telemetry, and cryptographic key management. Drop-in compatible with standard OpenAI SDKs.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/register">
            <Button variant="primary" size="md" className="gap-2 px-5 py-2.5 font-medium shadow-md">
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="md" className="px-5 py-2.5 text-zinc-300">
              Sign In to Console
            </Button>
          </Link>
        </div>

        {/* 1-Line Drop-in Code Card */}
        <div className="w-full max-w-2xl mt-14 text-left">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs font-mono text-zinc-400">quickstart.py</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-16 text-left">
          <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-3.5">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Mid-Stream Failover</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Automated routing across Groq and Gemini. If an upstream provider throttles (HTTP 429) or crashes, failover occurs seamlessly.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-3.5">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Zero-Overhead Telemetry</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Decoupled asynchronous logging via Redis and BullMQ. Track tokens, latency, and status in PostgreSQL without blocking user streams.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-3.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Virtual Scoped Keys</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Issue scoped API keys (<code className="text-zinc-300 font-mono text-[11px]">gw_live_...</code>) with custom RPM limits and spend caps to prevent runaway bills.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>LLM Gateway • High Availability Proxy</span>
          </div>
          <span>Encrypted with SHA-256 and rotating session tokens</span>
        </div>
      </footer>
    </div>
  );
}

