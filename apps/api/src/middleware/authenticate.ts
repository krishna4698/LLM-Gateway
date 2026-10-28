import type { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/api-key.service.ts';

// Extend Express Request type to include gateway metadata
declare global {
  namespace Express {
    interface Request {
      gatewayKey?: Awaited<ReturnType<typeof validateApiKey>>;
    }
  }
}

export async function authenticateGatewayKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing or malformed Authorization header. Expected: Bearer gw_live_...',
        type: 'invalid_request_error',
        code: 'invalid_api_key',
      },
    });
  }

  const rawKey = authHeader.replace('Bearer ', '').trim();

  try {
    const keyRecord = await validateApiKey(rawKey);

    if (!keyRecord) {
      return res.status(401).json({
        error: {
          message: 'Incorrect or inactive API key provided.',
          type: 'authentication_error',
          code: 'invalid_api_key',
        },
      });
    }

    // Attach verified key metadata to the request for rate limiting & billing
    req.gatewayKey = keyRecord;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({
      error: {
        message: 'Internal error verifying API key.',
        type: 'gateway_error',
      },
    });
  }
}
