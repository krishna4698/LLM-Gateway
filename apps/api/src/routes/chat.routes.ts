import { Router, type IRouter } from 'express';
import { routeAndExecute, routeAndStream } from '../gateway/router.ts';
import { authenticateGatewayKey } from '../middleware/authenticate.ts';
import { addToRedis } from '../queues/usage.queue.ts';

export const chatRouter: IRouter = Router();


// POST /v1/chat/completions (protected by Gateway Key auth)
chatRouter.post('/completions', authenticateGatewayKey, async (req, res) => {
  try {
    const startTime= Date.now();
    const { model = 'smart-chat', messages, temperature, maxTokens, stream = false } = req.body;

    // Validate request structure
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: "Missing required parameter: 'messages' must be a non-empty array.",
          type: 'invalid_request_error',
        },
      });
    }

    // Client disconnect handler: if client closes tab, abort upstream request to save cost
    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    // ⚡ 1. STREAMING MODE (Server-Sent Events)
    if (stream === true) {
      const requestId = `req_${Date.now()}`;
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let promptTokens = 0;
      let completionTokens = 0;
      let totalTokens = 0;

      try {
        const streamGenerator = routeAndStream(
          { model, messages, temperature, maxTokens },
          abortController.signal
        );

        for await (const chunk of streamGenerator) {
          res.write(chunk);

          
          if (chunk.includes('"usage":')) {
            try {
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && line.includes('"usage"')) {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.usage) {
                    promptTokens = parsed.usage.prompt_tokens || 0;
                    completionTokens = parsed.usage.completion_tokens || 0;
                    totalTokens = parsed.usage.total_tokens || 0;
                  }
                }
              }
            } catch {
              // Ignore partial JSON frames
            }
          }
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        res.write(`data: {"error": {"message": "${(streamError as Error).message}", "type": "stream_error"}}\n\n`);
        res.write('data: [DONE]\n\n');
      } finally {
        const totalLatency = Date.now() - startTime;
        res.end();

        addToRedis({
          requestId,
          apiKeyId: req.gatewayKey?.id,
          projectId: req.gatewayKey?.projectId,
          modelAlias: model,
          provider: 'stream',
          providerModel: model,
          inputTokens: promptTokens,
          outputTokens: completionTokens,
          totalTokens: totalTokens,
          costUsd: 0,
          latencyMs: totalLatency,
          status: 'success',
          statusCode: 200,
        });
      }
      return;
    }


    const { result, usedFallback, attempts } = await routeAndExecute({
      model,
      messages,
      temperature,
      maxTokens,
    });

    const totalLatency= Date.now()- startTime;
       const requestId= `req${Date.now()}`;

    // Add debug metadata headers for transparency
    res.setHeader('X-Gateway-Provider', result.model);
    res.setHeader('X-Gateway-Fallback', String(usedFallback));
    res.setHeader('X-Gateway-Attempts', String(attempts.length));

    // Standard OpenAI response
     res.json({
      id: result.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result.content,
          },
          finish_reason: result.finishReason,
        },
      ],
      usage: {
        prompt_tokens: result.usage.promptTokens,
        completion_tokens: result.usage.completionTokens,
        total_tokens: result.usage.totalTokens,
      },
      usedFallback,
      attempts
    });

    addToRedis({
      
      requestId,
      apiKeyId: req.gatewayKey?.id,
      projectId: req.gatewayKey?.projectId,
      modelAlias: model,
      provider: attempts[attempts.length - 1]?.provider || 'unknown',
      providerModel: result.model,
      inputTokens: result.usage.promptTokens,
      outputTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      costUsd:0,
      latencyMs: totalLatency,
      status: 'success',
      statusCode: 200,

    })
    
  } catch (error) {
    console.error('Gateway Router Error:', error);
    return res.status(502).json({
      error: {
        message: (error as Error).message,
        type: 'gateway_failover_error',
      },
    });
  }
});
