import { Router, type IRouter } from 'express';
import { prisma } from '@repo/db';
import { generateApiKey } from '../services/api-key.service.ts';
import { authenticateUser } from '../middleware/auth-user.ts';

export const keysRouter: IRouter = Router();

// POST /v1/keys - Create a new Gateway API Key (Scoped to user's project)
keysRouter.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    const { name = 'Default API Key', projectId, rateLimitRpm = 60, monthlyCapUsd = null } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: { message: 'Missing required field: projectId' },
      });
    }

    // 🔒 Security Check: Verify the project belongs to the authenticated user
    const project = await prisma.Project.where({
      id: Number(projectId),
      userId,
    }).first();

    if (!project) {
      return res.status(403).json({
        error: { message: 'Unauthorized: Project not found or does not belong to you.' },
      });
    }

    // Generate cryptographic key pair: raw secret + SHA-256 hash
    const { rawKey, prefix, secretHash } = generateApiKey();

    const created = await prisma.GatewayKey.create({
      name: name.trim(),
      prefix,
      secretHash,
      projectId: Number(projectId),
      rateLimitRpm: Number(rateLimitRpm),
      monthlyCapUsd: monthlyCapUsd ? Number(monthlyCapUsd) : null,
      status: 'active',
    });

    // Return the raw secret key ONCE so the user can copy it
    return res.status(201).json({
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      apiKey: rawKey,
      rateLimitRpm: created.rateLimitRpm,
      monthlyCapUsd: created.monthlyCapUsd,
      status: created.status,
      createdAt: created.createdAt,
    });
  } catch (error) {
    console.error('Key creation error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// GET /v1/keys?projectId=1 - List keys for a project (never returns secretHash or raw key)
keysRouter.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        error: { message: 'Missing required query param: projectId' },
      });
    }

    // 🔒 Security Check: Verify project belongs to user
    const project = await prisma.Project.where({
      id: Number(projectId),
      userId,
    }).first();

    if (!project) {
      return res.status(403).json({
        error: { message: 'Unauthorized: Project not found or does not belong to you.' },
      });
    }

    const keys = await prisma.GatewayKey.where({
      projectId: Number(projectId),
    }).all();

    return res.json({
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        status: k.status,
        rateLimitRpm: k.rateLimitRpm,
        monthlyCapUsd: k.monthlyCapUsd,
        createdAt: k.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch keys error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// DELETE /v1/keys/:id - Revoke a key (soft delete)
keysRouter.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    const id = Number(req.params.id);

    // 1. Find key
    const key = await prisma.GatewayKey.where({ id }).first();
    if (!key) {
      return res.status(404).json({ error: { message: 'Key not found.' } });
    }

    // 2. 🔒 Security Check: Verify user owns the key's parent project
    const project = await prisma.Project.where({
      id: key.projectId,
      userId,
    }).first();

    if (!project) {
      return res.status(403).json({
        error: { message: 'Unauthorized: You do not own this API key.' },
      });
    }

    // 3. Mark revoked in PostgreSQL
    await prisma.GatewayKey.where({ id }).update({
      status: 'revoked',
    });

    return res.json({ success: true, message: `Key ${id} has been revoked.` });
  } catch (error) {
    console.error('Revoke key error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});
