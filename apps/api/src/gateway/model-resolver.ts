export interface ModelDeployment {
  provider: 'gemini' | 'groq';
  providerModel: string;
  priority: number; // 1 = Primary, 2 = Fallback 1, etc.
}

// 🗺️ The Virtual Model Registry
export const VIRTUAL_MODELS: Record<string, ModelDeployment[]> = {
  // "smart-chat": High capability (Primary = Gemini 3.8 Flash, Fallback = Groq GPT-OSS 120B)
  'smart-chat': [
    { provider: 'gemini', providerModel: 'gemini-3.5-flash-lite', priority: 1 },
    { provider: 'groq', providerModel: 'openai/gpt-oss-120b', priority: 2 },
  ],

  // "fast-chat": Ultra-low latency (Primary = Groq GPT-OSS 120B, Fallback = Gemini 3.8 Flash)
  'fast-chat': [
    { provider: 'groq', providerModel: 'openai/gpt-oss-120b', priority: 1 },
    { provider: 'gemini', providerModel: 'gemini-3.8-flash', priority: 2 },
  ],
};

/**
 * Resolves any model string (alias or direct model) into an ordered list of deployments
 */
export function resolveModel(requestedModel: string): ModelDeployment[] {
  // 1. Check if it's a known virtual alias ('smart-chat', 'fast-chat')
  if (VIRTUAL_MODELS[requestedModel]) {
    return VIRTUAL_MODELS[requestedModel];
  }

  // 2. Direct Groq model passthrough
  if (
    requestedModel.startsWith('openai/') ||
    requestedModel.includes('llama') ||
    requestedModel.includes('qwen') ||
    requestedModel.includes('groq')
  ) {
    return [{ provider: 'groq', providerModel: requestedModel, priority: 1 }];
  }

  // 3. Direct Gemini model passthrough
  if (requestedModel.includes('gemini')) {
    return [{ provider: 'gemini', providerModel: requestedModel, priority: 1 }];
  }

  // 4. Default fallback if model is unknown
  return VIRTUAL_MODELS['smart-chat']!;
}
