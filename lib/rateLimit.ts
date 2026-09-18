import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
let limiter: Ratelimit | undefined;
export async function allowContact(ip: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return false;
  limiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(5, '1 h'),
    prefix: 'signal:contact',
    analytics: false,
  });
  return (await limiter.limit(ip)).success;
}
