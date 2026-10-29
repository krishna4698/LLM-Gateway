import type { ProviderAdapter, ProviderCallOptions } from './provider.interface.ts';
import type { GatewayRequest, GatewayResult } from '../types/gateway.ts';

export class GroqAdapter implements ProviderAdapter {
  readonly name = 'groq';

  async generate(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): Promise<GatewayResult> {
    // 1. Resolve Groq model
    const model = request.model && !request.model.includes('gemini')
      ? request.model
      : 'openai/gpt-oss-120b';

    // 2. Build Groq payload (Groq uses standard OpenAI schema!)
    const payload: Record<string, unknown> = {
      model,
      messages: request.messages,
    };

    if (request.temperature !== undefined) {
      payload.temperature = request.temperature;
    }

    if (request.maxTokens !== undefined) {
      payload.max_tokens = request.maxTokens;
    }

    // 3. Prepare HTTP fetch options
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(payload),
    };

    if (options.signal) {
      fetchOptions.signal = options.signal;
    }

    // 4. Send request to Groq OpenAI-compatible endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', fetchOptions);

    if (!response.ok) {
      const errorJson = (await response.json().catch(() => ({}))) as {
        error?: { message?: string; type?: string; code?: string };
      };
      const errorMessage =
        errorJson.error?.message || `Groq API returned HTTP status ${response.status}`;
      throw new Error(`[Groq Error] ${errorMessage}`);
    }

    const data = (await response.json()) as {
      id?: string;
      model?: string;
      choices?: Array<{
        message?: { content?: string };
        finish_reason?: string;
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    // 5. Map to standard GatewayResult
    const content = data.choices?.[0]?.message?.content || '';
    const finishReason = data.choices?.[0]?.finish_reason || 'stop';

    return {
      id: data.id || `chatcmpl-${Date.now()}`,
      model: data.model || model,
      content,
      finishReason,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async *stream(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): AsyncIterable<string> {
    const model = request.model && !request.model.includes('gemini')
      ? request.model
      : 'openai/gpt-oss-120b';

    const payload: Record<string, unknown> = {
      model,
      messages: request.messages,
      stream: true,
    };

    if (request.temperature !== undefined) {
      payload.temperature = request.temperature;
    }

    if (request.maxTokens !== undefined) {
      payload.max_tokens = request.maxTokens;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify(payload),
    };

    if (options.signal) {
      fetchOptions.signal = options.signal;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', fetchOptions);

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`[Groq Stream Error] HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader(); // this method gives you a reader object that lets you read from the response stream one chunk at a time
    const decoder = new TextDecoder(); //converts  bytes into readable text

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  }
}
