/**
 * Rate limiting — sliding window, in-memory.
 *
 * Good for a single-instance deployment (Stage 1 on Render). When the platform
 * goes multi-instance, swap the store for Redis/Upstash behind the same
 * interface; callers don't change.
 */

type Window = { timestamps: number[] };

const store = new Map<string, Window>();

// Periodic sweep so the map doesn't grow unbounded.
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
let lastSweep = Date.now();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();

  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    lastSweep = now;
    for (const [k, w] of store) {
      if (w.timestamps.every((t) => now - t > windowMs)) store.delete(k);
    }
  }

  const w = store.get(key) ?? { timestamps: [] };
  w.timestamps = w.timestamps.filter((t) => now - t < windowMs);

  if (w.timestamps.length >= limit) {
    const oldest = Math.min(...w.timestamps);
    store.set(key, w);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  w.timestamps.push(now);
  store.set(key, w);
  return { allowed: true, remaining: limit - w.timestamps.length, retryAfterSeconds: 0 };
}

/** Client IP from proxy headers (Render/Cloudflare set x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
