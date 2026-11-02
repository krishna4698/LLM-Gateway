import type { Request, Response, NextFunction } from 'express';
import {  type AccessTokenPayload } from '../services/auth.service.ts';
import { redis } from '@repo/redis';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
   try{
const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or malformed Authorization header. Expected Bearer <token>.',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const payload = jwt.verify(token, "default_secret") as AccessTokenPayload;

  // Check Redis denylist for revoked JTI (<1ms latency)
  const isRevoked = await redis.get(`denylist:${payload.jti}`);
  if (isRevoked) {
    return res.status(401).json({ error: 'Token has been revoked (logged out).' });
  }

  // Attach decoded user payload to request
  req.user = payload;
  next();
   }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}