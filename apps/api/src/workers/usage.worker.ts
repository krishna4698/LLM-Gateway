import { Worker } from 'bullmq'
import { prisma } from '@repo/db'
import type { UsageJobData } from '../queues/usage.queue.ts';

import { createRedisClient } from '@repo/redis'

const workerConnection= createRedisClient();

export const usageWorker= new Worker<UsageJobData>(
    'usage-tracking',
    async (job)=>{
      const data= job.data;

      await prisma.UsageRecord.create({
      requestId: data.requestId,
      projectId: data.projectId ?? null,
      apiKeyId: data.apiKeyId ?? null,
      modelAlias: data.modelAlias,
      provider: data.provider,
      providerModel: data.providerModel,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.totalTokens,
      costUsd: data.costUsd,
      latencyMs: data.latencyMs ?? null,
      status: data.status,
      statusCode: data.statusCode,
    });
  },
  {
    connection: workerConnection,
    concurrency: 5, // Process up to 5 writes simultaneously (safely within Postgres limits)
  }
);

usageWorker.on('completed', (job) => {
  console.log(`[UsageWorker]  Saved usage for request ${job.data.requestId}`);
});
usageWorker.on('failed', (job, err) => {
  console.error(`[UsageWorker]  Failed to save ${job?.data.requestId}:`, err.message);
});