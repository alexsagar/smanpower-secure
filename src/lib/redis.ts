import { Redis } from '@upstash/redis';

/**
 * Safe Redis Client Initialization
 * Do not crash the application if Redis is unavailable locally.
 */
export const getRedisClient = (): Redis | null => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({
      url,
      token,
    });
  } catch (error) {
    console.error('Failed to initialize Upstash Redis client:', error);
    return null;
  }
};

export const redis = getRedisClient();
