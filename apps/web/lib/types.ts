export interface Project {
  id: number;
  name: string;
  slug: string;
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

