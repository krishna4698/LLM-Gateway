import { Router, type IRouter } from 'express';
import { routeAndExecute } from '../gateway/router.ts';
import { authenticateGatewayKey } from '../middleware/authenticate.ts';
import { addToRedis } from '../queues/usage.queue.ts';

export const chatRouter: IRouter = Router();


// POST /v1/chat/completions (protected by Gateway Key auth)
chatRouter.post('/completions', authenticateGatewayKey, async (req, res) => {
  try {
    const startTime= Date.now();
    const { model = 'smart-chat', messages, temperature, maxTokens } = req.body;

    // Validate request structure
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: "Missing required parameter: 'messages' must be a non-empty array.",
          type: 'invalid_request_error',
        },
      });
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
