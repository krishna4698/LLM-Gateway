import type { ProviderAdapter, ProviderCallOptions } from './provider.interface.ts';
import type { GatewayRequest, GatewayResult } from '../types/gateway.ts';

export class GeminiAdapter implements ProviderAdapter {
  readonly name = 'gemini';

  async generate(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): Promise<GatewayResult> {
    // 1. Separate system instructions (Gemini handles system prompt separately)
    const systemMessage = request.messages.find((m) => m.role === 'system');
    console.log(systemMessage, "systemMessage")
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');
    console.log(conversationMessages, "conversationMessages")

    // 2. Translate OpenAI messages to Gemini 'contents' format
    const contents = conversationMessages.map((msg) => ({
      // OpenAI uses 'assistant', Gemini uses 'model'
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  console.log(contents, "contents")
    // 3. Build the Gemini request payload
    const payload: Record<string, unknown> = { contents };
  
    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (request.temperature !== undefined || request.maxTokens !== undefined) {
      payload.generationConfig = {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      };
    }

    // 4. Resolve model name (map deprecated models to current Gemini 3.8 Flash)
    let model = request.model;
    if (!model || model === 'gemini-1.5-flash' || model === 'gemini-2.5-flash' || !model.includes('gemini')) {
      model = 'gemini-3.8-flash';
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options.apiKey}`;

    // 5. Send native fetch request to Google
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    if (options.signal) {
      fetchOptions.signal = options.signal;
    }

    const response = await fetch(endpoint, fetchOptions);
    // console.log(response, "response")
    if (!response.ok) {
      const errorJson = (await response.json().catch(() => ({}))) as {
        error?: { message?: string; status?: string };
      };
      const errorMessage =
        errorJson.error?.message || `Gemini API returned HTTP status ${response.status}`;
      throw new Error(`[Gemini Error] ${errorMessage}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    // 6. Translate response back to Gateway standard format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const finishReason = data.candidates?.[0]?.finishReason?.toLowerCase() || 'stop';

    return {
      id: `chatcmpl-${Date.now()}`,
      model,
      content,
      finishReason: finishReason === 'stop' ? 'stop' : finishReason,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async *stream(
    request: GatewayRequest,
    options: ProviderCallOptions
  ): AsyncIterable<string> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const payload: Record<string, unknown> = { contents };

    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (request.temperature !== undefined || request.maxTokens !== undefined) {
      payload.generationConfig = {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      };
    }

    let model = request.model;
    if (!model || model === 'gemini-1.5-flash' || model === 'gemini-2.5-flash' || !model.includes('gemini')) {
      model = 'gemini-3.8-flash';
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${options.apiKey}`;

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    if (options.signal) {
      fetchOptions.signal = options.signal;
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok || !response.body) {
      const errorJson = (await response.json().catch(() => ({}))) as {
        error?: { message?: string; status?: string };
      };
      const errorMessage =
        errorJson.error?.message || `Gemini API returned HTTP status ${response.status}`;
      throw new Error(`[Gemini Stream Error] ${errorMessage}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const streamId = `chatcmpl-${Date.now()}`;
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last incomplete fragment in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              const finishReason = data.candidates?.[0]?.finishReason?.toLowerCase() || null;

              if (text !== undefined) {
                const openAIChunk = {
                  id: streamId,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: { content: text },
                      finish_reason: finishReason === 'stop' ? 'stop' : finishReason,
                    },
                  ],
                };
                yield `data: ${JSON.stringify(openAIChunk)}\n\n`;
              }

              // 🌟 If Gemini sends the final usageMetadata frame, format into standard OpenAI usage chunk
              if (data.usageMetadata) {
                const usageChunk = {
                  id: streamId,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: {},
                      finish_reason: 'stop',
                    },
                  ],
                  usage: {
                    prompt_tokens: data.usageMetadata.promptTokenCount || 0,
                    completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
                    total_tokens: data.usageMetadata.totalTokenCount || 0,
                  },
                };
                yield `data: ${JSON.stringify(usageChunk)}\n\n`;
              }
            } catch {
              // Ignore partial or non-JSON SSE frames
            }
          }
        }
      }

      yield 'data: [DONE]\n\n';
    } finally {
      reader.releaseLock();
    }
  }
}
