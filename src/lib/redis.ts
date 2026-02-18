import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

/**
 * Returns an Upstash Redis client if KV credentials are configured,
 * or null when running locally without them (file fallback mode).
 */
export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  _redis = new Redis({ url, token });
  return _redis;
}
