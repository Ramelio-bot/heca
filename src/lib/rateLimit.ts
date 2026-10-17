// Rate limiter sederhana berbasis Map (per server instance).
// Cukup untuk single-instance Vercel serverless.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max = 5, windowMs = 15 * 60 * 1000): {
  allowed: boolean;
  retryAfter: number;
} {
  const now = Date.now();
  const rec = attempts.get(key);

  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (rec.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }

  rec.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
