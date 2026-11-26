'use client';

import * as React from 'react';
import {
  Activity,
  Clock,
  Coins,
  Cpu,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { useLogsQuery } from '../../../api/logs/logs.queries';

interface LogsViewProps {
  projectId: number;
  projectName: string;
}

const PAGE_SIZE = 25;

export function LogsView({ projectId, projectName }: LogsViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [providerFilter, setProviderFilter] = React.useState<string>('');
  const [offset, setOffset] = React.useState<number>(0);

  // Reset pagination when project or filters change
  React.useEffect(() => {
    setOffset(0);
  }, [projectId, statusFilter, providerFilter]);

  const { data, isLoading, isFetching, refetch } = useLogsQuery(projectId, {
    limit: PAGE_SIZE,
    offset,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(providerFilter ? { provider: providerFilter } : {}),
  });

  const summary = data?.summary;
  const pagination = data?.pagination;
  const logs = data?.data ?? [];

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Requests</span>
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100 font-mono">
            {(summary?.totalRequests ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 font-mono">
            <span className="text-emerald-400">{summary?.successCount ?? 0} ok</span>
            {' · '}
            <span className={summary?.errorCount ? 'text-rose-400' : 'text-zinc-500'}>
              {summary?.errorCount ?? 0} err
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Tokens</span>
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100 font-mono">
            {(summary?.totalTokens ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 font-mono">
            {(summary?.totalInputTokens ?? 0).toLocaleString()} in · {(summary?.totalOutputTokens ?? 0).toLocaleString()} out
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Avg Latency</span>
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100 font-mono">
            {summary?.avgLatencyMs ?? 0} <span className="text-sm text-zinc-500 font-normal">ms</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            End-to-end gateway timing
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Cost</span>
            <Coins className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-100 font-mono">
            ${(summary?.totalCostUsd ?? 0).toFixed(4)}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Accumulated project spend
          </div>
        </div>
      </div>

      {/* Logs Panel */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/20">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Request Telemetry</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live execution history for <strong className="text-zinc-300 font-medium">{projectName}</strong> persisted via BullMQ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="h-8 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              aria-label="Filter by provider"
              className="h-8 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              <option value="">All Providers</option>
              <option value="groq">Groq</option>
              <option value="gemini">Gemini</option>
              <option value="stream">Stream</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Table / Loading / Empty */}
        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-zinc-500 text-xs gap-2 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span>Loading request logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200">No request logs found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              {statusFilter || providerFilter
                ? 'No logs match your current filters. Try clearing the status or provider filter.'
                : `Send a chat completion request using an API key from ${projectName} to see live latency, token counts, and provider routing here.`}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Time</th>
                  <th className="py-3 px-5">Model</th>
                  <th className="py-3 px-5">Provider</th>
                  <th className="py-3 px-5">Tokens</th>
                  <th className="py-3 px-5">Latency</th>
                  <th className="py-3 px-5">Cost</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                      {formatTimestamp(log.createdAt)}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-medium text-zinc-100 font-mono text-[11px]">
                        {log.modelAlias}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {log.providerModel}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <Badge variant="neutral" className="font-mono text-[11px]">
                        {log.provider}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-zinc-300">
                      <div>{log.totalTokens.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">
                        {log.inputTokens} in / {log.outputTokens} out
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-zinc-300 whitespace-nowrap">
                      {log.latencyMs !== null ? `${log.latencyMs} ms` : '—'}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-zinc-300 whitespace-nowrap">
                      ${log.costUsd.toFixed(5)}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Badge variant={log.status === 'success' ? 'active' : 'revoked'}>
                        {log.statusCode} {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.total > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800/60 bg-zinc-900/20 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[11px]">
              Showing {offset + 1}–{Math.min(offset + logs.length, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0 || isFetching}
                onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasMore || isFetching}
                onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
