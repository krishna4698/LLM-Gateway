import { Router, type IRouter } from 'express';
import { prisma } from '@repo/db';
import { generateApiKey } from '../services/api-key.service.ts';

export const keysRouter: IRouter = Router();

// POST /v1/keys - Create a new Gateway API Key
keysRouter.post('/', async (req, res) => {
  try {
    const { name = 'Default API Key', projectId, rateLimitRpm = 60 } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: { message: 'Missing required field: projectId' },
      });
    }

    const { rawKey, prefix, secretHash } = generateApiKey();

    const created = await prisma.GatewayKey.create({
      name,
      prefix,
      secretHash,
      projectId: Number(projectId),
      rateLimitRpm: Number(rateLimitRpm),
      status: 'active',
    });

   
    return res.status(201).json({
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      apiKey: rawKey,
      rateLimitRpm: created.rateLimitRpm,
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

// GET /v1/keys?projectId=1 - List keys (never returns secretHash or raw key)
keysRouter.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;

    const query = projectId ? { projectId: Number(projectId) } : {};
    const keys = await prisma.GatewayKey.where(query).all();

    return res.json({
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        status: k.status,
        rateLimitRpm: k.rateLimitRpm,
        createdAt: k.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// DELETE /v1/keys/:id - Revoke a key (soft delete)
keysRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.GatewayKey.where({ id }).update({
      status: 'revoked',
    });

    return res.json({ success: true, message: `Key ${id} has been revoked.` });
  } catch (error) {
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// POST /v1/keys - Create a new Gateway API Key
keysRouter.post('/', async (req, res) => {
  try {
    const { name = 'Default API Key', projectId, rateLimitRpm = 60 } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: { message: 'Missing required field: projectId' },
      });
    }

    const { rawKey, prefix, secretHash } = generateApiKey();

    const created = await prisma.GatewayKey.create({
      name,
      prefix,
      secretHash,
      projectId: Number(projectId),
      rateLimitRpm: Number(rateLimitRpm),
      status: 'active',
    });

    return res.status(201).json({
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      apiKey: rawKey,
      rateLimitRpm: created.rateLimitRpm,
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

// GET /v1/keys?projectId=1 - List keys (never returns secretHash or raw key)
keysRouter.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;

    const query = projectId ? { projectId: Number(projectId) } : {};
    const keys = await prisma.GatewayKey.where(query).all();

    return res.json({
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        status: k.status,
        rateLimitRpm: k.rateLimitRpm,
        createdAt: k.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

// DELETE /v1/keys/:id - Revoke a key (soft delete)
keysRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.GatewayKey.where({ id }).update({
      status: 'revoked',
    });

    return res.json({ success: true, message: `Key ${id} has been revoked.` });
  } catch (error) {
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});

