const attempts = new Map<string, { count: number; resetAt: number }>();

export function assertAttemptAllowed(key: string, limit: number, windowMilliseconds: number, now = Date.now()) {
  const attempt = attempts.get(key);
  if (!attempt || attempt.resetAt <= now) return;
  if (attempt.count >= limit) throw new Error("Too many sign-in attempts. Please try again later.");
}

export function recordFailedAttempt(key: string, windowMilliseconds: number, now = Date.now()) {
  const attempt = attempts.get(key);
  if (!attempt || attempt.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + windowMilliseconds });
  else attempt.count += 1;
}

export function clearAttempts(key: string) { attempts.delete(key); }
