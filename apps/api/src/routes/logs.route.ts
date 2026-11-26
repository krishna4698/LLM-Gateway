import { Router, type IRouter } from 'express';
import { prisma } from '@repo/db';
import { authenticateUser } from '../middleware/auth-user.ts';

export const logsRouter: IRouter = Router();

// GET /v1/logs?projectId=1&limit=50&offset=0&status=success&provider=groq
logsRouter.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = Number(req.user!.userId);
    const { projectId, status, provider } = req.query;

    const parsedProjectId = Number(projectId);
    if (!projectId || Number.isNaN(parsedProjectId)) {
      return res.status(400).json({
        error: { message: 'Missing or invalid query param: projectId' },
      });
    }

    const project = await prisma.Project.where({
      id: parsedProjectId,
      userId,
    }).first();

    if (!project) {
      return res.status(403).json({
        error: { message: 'Unauthorized: Project not found or does not belong to you.' },
      });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const allRecords = await prisma.UsageRecord.where({
      projectId: parsedProjectId,
    }).all();

   
    allRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    let successCount = 0;
    let errorCount = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let totalLatencyMs = 0;
    let latencyCount = 0;

    for (const r of allRecords) {
      if (r.status === 'success') successCount++;
      else errorCount++;

      totalInputTokens += r.inputTokens || 0;
      totalOutputTokens += r.outputTokens || 0;
      totalTokens += r.totalTokens || 0;
      totalCostUsd += Number(r.costUsd || 0);

      if (typeof r.latencyMs === 'number') {
        totalLatencyMs += r.latencyMs;
        latencyCount++;
      }
    }

    // Apply optional filters
    const filtered = allRecords.filter((r) => {
      if (status && typeof status === 'string' && r.status !== status) return false;
      if (provider && typeof provider === 'string' && r.provider !== provider) return false;
      return true;
    });

    const paginated = filtered.slice(offset, offset + limit);

    return res.json({
      summary: {
        totalRequests: allRecords.length,
        successCount,
        errorCount,
        totalInputTokens,
        totalOutputTokens,
        totalTokens,
        totalCostUsd: Number(totalCostUsd.toFixed(6)),
        avgLatencyMs: latencyCount > 0 ? Math.round(totalLatencyMs / latencyCount) : 0,
      },
      pagination: {
        total: filtered.length,
        limit,
        offset,
        hasMore: offset + paginated.length < filtered.length,
      },
      data: paginated.map((r) => ({
        id: r.id,
        requestId: r.requestId,
        projectId: r.projectId,
        apiKeyId: r.apiKeyId,
        modelAlias: r.modelAlias,
        provider: r.provider,
        providerModel: r.providerModel,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        totalTokens: r.totalTokens,
        costUsd: Number(r.costUsd || 0),
        latencyMs: r.latencyMs,
        status: r.status,
        statusCode: r.statusCode,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return res.status(500).json({
      error: { message: (error as Error).message },
    });
  }
});
