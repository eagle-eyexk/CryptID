const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

// ─── Rate Limiter ────────────────────────────────────────────────────────────

type RateEntry = { attempts: number; lockUntil?: number; windowStart: number };
let rateEntry: RateEntry | null = null;

export async function checkRateLimit(): Promise<{ allowed: boolean; remainingSecs: number }> {
  try {
    const entry = rateEntry;
    if (!entry) return { allowed: true, remainingSecs: 0 };

    // Window expired — reset silently
    if (Date.now() - entry.windowStart > 10 * 60_000) {
      rateEntry = null;
      return { allowed: true, remainingSecs: 0 };
    }
    // Active lockout
    if (entry.lockUntil && Date.now() < entry.lockUntil) {
      const secs = Math.ceil((entry.lockUntil - Date.now()) / 1000);
      return { allowed: false, remainingSecs: secs };
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_MS;
      rateEntry = { ...entry, lockUntil };
      return { allowed: false, remainingSecs: 30 };
    }
    return { allowed: true, remainingSecs: 0 };
  } catch {
    return { allowed: true, remainingSecs: 0 };
  }
}

export async function recordFailedAttempt(): Promise<void> {
  try {
    const entry: RateEntry = rateEntry ?? { attempts: 0, windowStart: Date.now() };
    const windowExpired = Date.now() - entry.windowStart > 10 * 60_000;
    const attempts = windowExpired ? 1 : entry.attempts + 1;
    const lockUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : undefined;
    rateEntry = { attempts, lockUntil, windowStart: windowExpired ? Date.now() : entry.windowStart };
  } catch {}
}

export async function resetRateLimit(): Promise<void> {
  rateEntry = null;
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

export function sanitize(input: string, maxLen = 100): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // strip control chars
    .replace(/[<>"'`]/g, "")          // strip injection chars
    .slice(0, maxLen);
}

export function validateUsername(raw: string): string | null {
  const v = sanitize(raw, 20);
  if (v.length < 3) return "At least 3 characters required";
  if (v.length > 20) return "Maximum 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return "Letters, numbers and _ only";
  return null;
}

export function validatePassphrase(raw: string): string | null {
  if (raw.length < 8) return "At least 8 characters required";
  if (raw.length > 64) return "Maximum 64 characters";
  if (!/[0-9]/.test(raw)) return "Include at least one number";
  if (!/[a-zA-Z]/.test(raw)) return "Include at least one letter";
  return null;
}

export function passphraseStrength(raw: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (raw.length >= 8) score++;
  if (raw.length >= 12) score++;
  if (/[0-9]/.test(raw) && /[a-zA-Z]/.test(raw)) score++;
  if (/[^a-zA-Z0-9]/.test(raw)) score = Math.min(3, score + 1);
  return score as 0 | 1 | 2 | 3;
}

export const STRENGTH_LABELS: Record<number, string> = {
  0: "Weak",
  1: "Fair",
  2: "Strong",
  3: "Fortress",
};

export const STRENGTH_COLORS: Record<number, string> = {
  0: "#FF4560",
  1: "#FFAA00",
  2: "#56CF90",
  3: "#4ECDC4",
};

// ─── Timing-safe comparison ──────────────────────────────────────────────────

/** Compare two strings in constant time to prevent timing attacks. */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
