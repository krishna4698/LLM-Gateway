import type { GatewayRequest, GatewayResult } from '../types/gateway.ts';

export interface ProviderCallOptions {
  apiKey: string;
  signal?: AbortSignal | undefined;
}

export interface ProviderAdapter {
  readonly name: string; // e.g. "gemini" | "openai" | "groq"

  generate(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): Promise<GatewayResult>;

  stream(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): AsyncIterable<string>;
}



