import {Queue} from 'bullmq'

import {createRedisClient} from '@repo/redis'

export interface UsageJobData {
  requestId: string;
  projectId?: number | null,
  apiKeyId?: number  | null;
  modelAlias: string;
  provider: string;
  providerModel: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs?: number;
  status: string;
  statusCode: number;
}

const queueConnection=  createRedisClient();

export const usageQueue= new Queue<UsageJobData>(
    'usage-tracking', {
        connection:queueConnection,
        defaultJobOptions:{
            attempts:5,
            backoff:{type:'exponential', delay:1000},
            removeOnComplete:1000,// remove 1000 jobs in history
            removeOnFail:5000  //keep 5000 jobs for inspection means dont remove if fails
        }
    }
)

export async function addToRedis(data:UsageJobData){
    try{
      await usageQueue.add('log-usage', data , {
        jobId:data.requestId // this is neccessary , unique
      })
    }
    catch(error){
     console.error(`failed while adding to redis requestId:${data.requestId}`)
    }
}
