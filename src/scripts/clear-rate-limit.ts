import { getRedisClient } from '../lib/redis';
import crypto from 'crypto';
import { parseArgs } from 'util';
import { getAppEnv } from '../lib/env';

async function main() {
  const appEnv = getAppEnv();
  if (appEnv !== 'local') {
    console.error(`[Error] Refusing to run in environment: ${appEnv}. This script requires APP_ENV=local.`);
    process.exit(1);
  }

  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      email: { type: 'string' },
      ip: { type: 'string' },
    },
  });

  const email = values.email || positionals[0];
  const ip = values.ip;

  if (!email || email.startsWith('--')) {
    console.error('[Error] Explicit --email argument (or positional argument) is required.');
    process.exit(1);
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('[Error] Redis client failed to initialize. Check UPSTASH_REDIS_REST_URL and TOKEN.');
    process.exit(1);
  }

  const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  console.log(`[Info] Normalized email hash: ${emailHash}`);

  // Fetch all keys in Upstash
  // Since Upstash Ratelimit prefixes keys and uses sliding window timestamps, we'll scan for the hash
  const keysToDelete: string[] = [];

  try {
    // Keys for email bucket
    const emailKeys = await redis.keys(`*login_email:${emailHash}*`);
    keysToDelete.push(...emailKeys);

    // Keys for combined bucket
    const combinedKeys = await redis.keys(`*login_combined:*_${emailHash}*`);
    keysToDelete.push(...combinedKeys);

    // Keys for IP bucket, if provided
    if (ip) {
      console.log(`[Info] IP bucket explicitly requested for IP: ${ip}`);
      const ipKeys = await redis.keys(`*login_ip:${ip}*`);
      keysToDelete.push(...ipKeys);
    }

    if (keysToDelete.length === 0) {
      console.log('[Info] No matching rate-limit keys found.');
      process.exit(0);
    }

    console.log(`[Info] Found ${keysToDelete.length} matching keys to delete:`);
    keysToDelete.forEach(k => console.log(` - ${k}`));

    const deletedCount = await redis.del(...keysToDelete);
    console.log(`[Success] Deleted ${deletedCount} rate-limit keys.`);
  } catch (error) {
    console.error('[Error] Failed to fetch or delete keys from Redis:', error);
    process.exit(1);
  }
}

main().catch(console.error);
