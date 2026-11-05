import  {Router, type  IRouter} from 'express';
import { prisma } from '@repo/db';
import {redis} from '@repo/redis';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { generateAccessToken , hashToken} from '../services/auth.service.ts';
import { authenticateUser } from '../middleware/auth-user.ts';

export const authRouter: IRouter = Router();

authRouter.post('/register', async (req, res) => {
 try{
    const {email, password, name}= req.body;
   if (!email || !password || !name) {
     return res.status(400).json({ error: 'Missing required fields' });
   }
   
   const existingUser = await prisma.User.where({ email }).first();
   if (existingUser) {
     return res.status(400).json({ error: 'User already exists' });
   }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.User.create({
    email,
    password: hashedPassword,
    name: name || null,
    creditsUsd: 0,
  });
  return res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
 }
 catch (error) {
  console.error('Registration error:', error);
  return res.status(500).json({ error: 'Internal server error' });
 }

})


authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await prisma.User.where({ email }).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const {accessToken}= generateAccessToken(user);
    const refreshToken=`rt_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash= hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        await prisma.RefreshToken.create({
            tokenHash,
            userId: user.id,
            userAgent:null,
            ipAddress:(req.ip as string) || null,
            expiresAt
        })
        res.cookie('refreshToken', refreshToken, {
          httpOnly:true,
          secure:process.env.NODE_ENV==='production',
          sameSite:'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
          path:'/'

        })
        return res.json({

            accessToken,
            refreshToken: refreshToken,
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                creditsUsd: user.creditsUsd,
            }
        })
}
catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({error:"Internal server error"})
}

})


authRouter.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const authHeader = req.headers.authorization;
    // 1. Revoke the Refresh Token in DB
    if (refreshToken) {
      const incomingHash = hashToken(refreshToken);
      await prisma.RefreshToken.where({ tokenHash: incomingHash }).update({
        revokedAt: new Date().toISOString(),
      });
    }
    // 2. Clear the httpOnly Cookie
    res.clearCookie('refreshToken', { path: '/' });

    // 3. Add current Access Token JTI to Redis Denylist
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.decode(token) as { jti?: string; exp?: number };
      if (decoded?.jti && decoded?.exp) {
        const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
        if (remainingSeconds > 0) {
          // Store in Redis with TTL equal to remaining life of the token!
          await redis.set(`denylist:${decoded.jti}`, 'revoked', 'EX', remainingSeconds);
        }
      }
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal logout error.' });
  }
});


authRouter.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.User.where({ id: Number(req.user!.userId) }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      creditsUsd: user.creditsUsd,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});


authRouter.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refreshToken in cookie or request body.' });
    }

    const incomingHash = hashToken(refreshToken);

    // 1. Look up token in DB
    const tokenRecord = await prisma.RefreshToken.where({ tokenHash: incomingHash }).first();
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or unrecognized refresh token.' });
    }

    // 2. Check if revoked (Theft Detection)
    if (tokenRecord.revokedAt) {
      return res.status(401).json({ error: 'Refresh token has already been revoked.' });
    }

    // 3. Check if expired
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Refresh token has expired. Please login again.' });
    }

    // 4. Fetch user
    const user = await prisma.User.where({ id: tokenRecord.userId }).first();
    if (!user) {
      return res.status(401).json({ error: 'User associated with token not found.' });
    }

    // 5. Token Rotation: Soft-delete old token
    await prisma.RefreshToken.where({ id: tokenRecord.id }).update({
      revokedAt: new Date().toISOString(),
    });

    // 6. Generate NEW token pair
    const newRefreshToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
    const newHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await prisma.RefreshToken.create({
      tokenHash: newHash,
      userId: user.id,
      userAgent: (req.headers['user-agent'] as string) || tokenRecord.userAgent,
      ipAddress: (req.ip as string) || tokenRecord.ipAddress,
      expiresAt: newExpiresAt,
    });

    const { accessToken } = generateAccessToken(user);

    // Set rotated httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh token.' });
  }
});
