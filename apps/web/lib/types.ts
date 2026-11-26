export interface Project {
  id: number;
  name: string;
  slug?: string;
  createdAt: string;
}

export interface GatewayKey {
  id: number;
  name: string;
  prefix: string;
  projectId: number;
  rateLimitRpm: number;
  monthlyCapUsd: number | null;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface GeneratedKeyResult {
  id: number;
  name: string;
  prefix: string;
  apiKey: string; // The raw secret key: "gw_live_..."
  rateLimitRpm: number;
  status: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  creditsUsd: number;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}

export interface UsageLog {
  id: number;
  requestId: string;
  projectId: number | null;
  apiKeyId: number | null;
  modelAlias: string;
  provider: string;
  providerModel: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number | null;
  status: string;
  statusCode: number;
  createdAt: string;
}

export interface LogsSummary {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
}

export interface LogsPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface LogsResponse {
  summary: LogsSummary;
  pagination: LogsPagination;
  data: UsageLog[];
}


