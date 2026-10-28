import 'dotenv/config';
import { Redis, type RedisOptions } from 'ioredis';

const DEFAULT_REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const defaultRedisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
};

/**
 * Creates a new Redis connection instance (useful for BullMQ workers and queues)
 */
export function createRedisClient(url = DEFAULT_REDIS_URL, options?: RedisOptions): Redis {
  return new Redis(url, {
    ...defaultRedisOptions,
    ...options,
  });
}


export const redis = createRedisClient(); // singleton 

export { Redis };
export type { RedisOptions };

