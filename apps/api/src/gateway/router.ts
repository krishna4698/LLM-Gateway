import type { ProviderAdapter } from '../providers/provider.interface.ts';
import type { GatewayRequest, GatewayResult } from '../types/gateway.ts';
import { GeminiAdapter } from '../providers/gemini.adapter.ts';
import { GroqAdapter } from '../providers/groq.adapter.ts';
import { resolveModel } from './model-resolver.ts';

// 1. Adapter Registry (Pluggable Architecture)
const adapters: Record<string, ProviderAdapter> = {
  gemini: new GeminiAdapter(),
  groq: new GroqAdapter(),
};

export interface RouteExecutionResult {
  result: GatewayResult;
  usedFallback: boolean;
  attempts: Array<{
    provider: string;
    model: string;
    latencyMs: number;
    error?: string;
  }>;
}

// const timeout = (ms:number)=>{  by using this method , it stays open the backgorund until google finshes request
//   return new Promise((resolve, reject) => {
//      setTimeout(()=>{
//        reject(new Error(`Request timed out after ${ms} ms`));
//      }, ms)
//   });
// }
export async function routeAndExecute(
  request: GatewayRequest,
  signal?: AbortSignal
): Promise<RouteExecutionResult> {
  const deployments = resolveModel(request.model);
  console.log(deployments, "deployments")
  const attempts: RouteExecutionResult['attempts'] = [];

  for (let i = 0; i < deployments.length; i++) {
    const deployment = deployments[i]!;
    const adapter = adapters[deployment.provider];

    if (!adapter) {
      continue;
    }

    // Get the appropriate provider key from environment
    const apiKey =
      deployment.provider === 'gemini'
        ? process.env.GEMINI_API_KEY
        : process.env.GROQ_API_KEY;

    if (!apiKey) {
      attempts.push({
        provider: deployment.provider,
        model: deployment.providerModel,
        latencyMs: 0,
        error: `API key for ${deployment.provider} not found in environment.`,
      });
      continue;
    }

    const startTime = Date.now();
    const timeoutMs = 4000
    const combinedSignal= signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs)
    try {
      const result = 
      //  await Promise.race([
       await  adapter.generate(
        { ...request, model: deployment.providerModel },
        { apiKey, signal:combinedSignal }
      )
      // timeout(5000)
      // ])
      
      

      const latencyMs = Date.now() - startTime;
      attempts.push({
        provider: deployment.provider,
        model: deployment.providerModel,
        latencyMs,
      });

      return {
        result,
        usedFallback: i > 0, // True if we had to failover past the primary!
        attempts,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = (error as Error).message;

      console.warn(
        ` [Failover] ${deployment.provider} (${deployment.providerModel}) failed: ${errorMsg}`
      );

      attempts.push({
        provider: deployment.provider,
        model: deployment.providerModel,
        latencyMs,
        error: errorMsg,
      });

      // If there are more deployments, continue to the next one (Failover!)
    }
  }

  // If every deployment failed:
  throw new Error(
    `All provider deployments failed. Attempts: ${JSON.stringify(attempts)}`
  );
}
