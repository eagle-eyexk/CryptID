import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { Pool } from "pg";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SESSION_DURATION_SECONDS = 24 * 60 * 60;
const COOKIE_NAME = "cryptid_session";
const LOGIN_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const SECURITY_EVENT_RETENTION_DAYS = 14;
const DUMMY_SALT = Buffer.from("637279707469642d64756d6d792d73616c74", "hex");

type Credentials = {
  username: string;
  normalizedUsername: string;
  passphrase: string;
};

type UserRow = {
  id: string;
  username: string;
  username_normalized: string;
  password_salt: string;
  password_hash: string;
  created_at: Date | string;
  expires_at?: Date | string;
};

type SecurityEventType =
  | "account_created"
  | "login_succeeded"
  | "auth_throttled"
  | "session_expired"
  | "session_revoked";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for shared account access.");
  }
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return pool;
}

function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function validateCredentials(body: unknown): Credentials | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.username !== "string" || typeof record.passphrase !== "string") {
    return null;
  }

  const username = record.username.trim();
  const normalizedUsername = username.toLowerCase();
  const passphrase = record.passphrase;
  if (!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(normalizedUsername)) return null;
  if (passphrase.length < 12 || passphrase.length > 128 || Buffer.byteLength(passphrase) > 512) {
    return null;
  }

  return { username, normalizedUsername, passphrase };
}

function derivePassphraseHash(passphrase: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      passphrase,
      salt,
      64,
      { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function rateLimitKey(purpose: "login" | "register", normalizedUsername: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(`${purpose}:${normalizedUsername}`)
    .digest("hex");
}

function readCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === COOKIE_NAME) {
      const value = part.slice(separator + 1).trim();
      return /^[A-Za-z0-9_-]{40,64}$/.test(value) ? value : null;
    }
  }
  return null;
}

function isSecureRequest(req: Request): boolean {
  const forwardedProto = req.header("x-forwarded-proto")?.split(",")[0].trim();
  return req.secure || forwardedProto === "https";
}

function setSessionCookie(req: Request, res: Response, token: string, expiresAt: Date) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}; Expires=${expiresAt.toUTCString()}${secure}`,
  );
}

function clearSessionCookie(req: Request, res: Response) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
  );
}

function serializeUser(row: UserRow, expiresAt: Date | string) {
  return {
    id: row.id,
    username: row.username,
    createdAt: new Date(row.created_at).toISOString(),
    sessionExpiresAt: new Date(expiresAt).toISOString(),
  };
}

async function recordSecurityEvent(
  eventType: SecurityEventType,
  userId: string | null = null,
) {
  try {
    const db = getPool();
    await db.query("DELETE FROM security_events WHERE expires_at <= now()");
    await db.query(
      `INSERT INTO security_events (user_id, event_type, expires_at)
       VALUES ($1, $2, now() + ($3::text || ' days')::interval)`,
      [userId, eventType, SECURITY_EVENT_RETENTION_DAYS],
    );
  } catch {
    // Keep internal alerts free of user data and request contents.
    console.error(`SECURITY_EVENT_PERSISTENCE_FAILED ${eventType}`);
  }
}

async function isRateLimited(identifierHash: string): Promise<number | null> {
  const result = await getPool().query(
    `SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM locked_until - now())))::integer AS retry_after
     FROM login_throttles
     WHERE identifier_hash = $1 AND locked_until > now()`,
    [identifierHash],
  );
  return result.rows[0]?.retry_after ?? null;
}

async function recordFailedAttempt(identifierHash: string): Promise<boolean> {
  const result = await getPool().query(
    `INSERT INTO login_throttles
       (identifier_hash, attempts, window_started_at, locked_until, updated_at)
     VALUES ($1, 1, now(), NULL, now())
     ON CONFLICT (identifier_hash) DO UPDATE SET
       attempts = CASE
         WHEN login_throttles.window_started_at < now() - ($2::text || ' minutes')::interval THEN 1
         ELSE login_throttles.attempts + 1
       END,
       window_started_at = CASE
         WHEN login_throttles.window_started_at < now() - ($2::text || ' minutes')::interval THEN now()
         ELSE login_throttles.window_started_at
       END,
       locked_until = CASE
         WHEN CASE
           WHEN login_throttles.window_started_at < now() - ($2::text || ' minutes')::interval THEN 1
           ELSE login_throttles.attempts + 1
         END >= $3
         THEN now() + ($4::text || ' seconds')::interval
         ELSE NULL
       END,
       updated_at = now()
     RETURNING locked_until > now() AS is_locked`,
    [identifierHash, LOGIN_WINDOW_MINUTES, MAX_FAILED_ATTEMPTS, LOCKOUT_SECONDS],
  );
  await getPool().query(
    `DELETE FROM login_throttles WHERE updated_at < now() - interval '24 hours'`,
  );
  return result.rows[0]?.is_locked === true;
}

async function clearFailedAttempts(identifierHash: string) {
  await getPool().query("DELETE FROM login_throttles WHERE identifier_hash = $1", [
    identifierHash,
  ]);
}

async function createSession(req: Request, res: Response, user: UserRow) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const db = getPool();

  await db.query("DELETE FROM auth_sessions WHERE expires_at <= now()");
  const session = await db.query(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING expires_at`,
    [user.id, tokenHash, expiresAt],
  );
  const exactExpiry = new Date(session.rows[0].expires_at);
  setSessionCookie(req, res, token, exactExpiry);
  return exactExpiry;
}

async function currentSession(req: Request, res: Response) {
  const token = readCookie(req);
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const db = getPool();
  const expired = await db.query(
    `DELETE FROM auth_sessions
     WHERE token_hash = $1 AND expires_at <= now()
     RETURNING user_id`,
    [tokenHash],
  );
  if (expired.rows[0]) {
    clearSessionCookie(req, res);
    await recordSecurityEvent("session_expired", expired.rows[0].user_id);
    return null;
  }

  const result = await db.query<UserRow>(
    `SELECT u.id, u.username, u.username_normalized, u.password_salt,
            u.password_hash, u.created_at, s.expires_at
     FROM auth_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
     LIMIT 1`,
    [tokenHash],
  );
  if (!result.rows[0]) {
    clearSessionCookie(req, res);
    return null;
  }
  return serializeUser(result.rows[0], result.rows[0].expires_at as Date | string);
}

function reportAuthFailure(res: Response, code: string) {
  console.error(`AUTH_SERVICE_FAILURE ${code}`);
  return res.status(503).json({ error: "Account access is temporarily unavailable." });
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/security/ghost-log", (_req, res) => {
    setNoStore(res);
    return res.json({ publicDetails: 0 });
  });

  app.post("/api/auth/register", async (req, res) => {
    setNoStore(res);
    const credentials = validateCredentials(req.body);
    if (!credentials) {
      return res.status(400).json({
        error: "Use a 3–24 character username and a 12–128 character passphrase.",
      });
    }

    try {
      const identifierHash = rateLimitKey("register", credentials.normalizedUsername);
      const retryAfter = await isRateLimited(identifierHash);
      if (retryAfter) {
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Please wait before trying again." });
      }

      const salt = randomBytes(16);
      const passwordHash = await derivePassphraseHash(credentials.passphrase, salt);
      let result;
      try {
        result = await getPool().query<UserRow>(
          `INSERT INTO users
             (username, username_normalized, password_salt, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING id, username, username_normalized, password_salt, password_hash, created_at`,
          [
            credentials.username,
            credentials.normalizedUsername,
            salt.toString("hex"),
            passwordHash.toString("hex"),
          ],
        );
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          const locked = await recordFailedAttempt(identifierHash);
          if (locked) {
            await recordSecurityEvent("auth_throttled");
            res.setHeader("Retry-After", String(LOCKOUT_SECONDS));
            return res.status(429).json({ error: "Please wait before trying again." });
          }
          return res.status(409).json({ error: "That username is unavailable." });
        }
        throw error;
      }

      const user = result.rows[0];
      const expiresAt = await createSession(req, res, user);
      await clearFailedAttempts(identifierHash);
      await recordSecurityEvent("account_created", user.id);
      return res.status(201).json({ user: serializeUser(user, expiresAt) });
    } catch {
      return reportAuthFailure(res, "registration");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    setNoStore(res);
    const credentials = validateCredentials(req.body);
    if (!credentials) {
      return res.status(400).json({
        error: "Use a 3–24 character username and a 12–128 character passphrase.",
      });
    }

    try {
      const identifierHash = rateLimitKey("login", credentials.normalizedUsername);
      const retryAfter = await isRateLimited(identifierHash);
      if (retryAfter) {
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Please wait before trying again." });
      }

      const result = await getPool().query<UserRow>(
        `SELECT id, username, username_normalized, password_salt,
                password_hash, created_at
         FROM users WHERE username_normalized = $1 LIMIT 1`,
        [credentials.normalizedUsername],
      );
      const user = result.rows[0];
      const salt = user ? Buffer.from(user.password_salt, "hex") : DUMMY_SALT;
      const actualHash = await derivePassphraseHash(credentials.passphrase, salt);
      const expectedHash = user ? Buffer.from(user.password_hash, "hex") : Buffer.alloc(64);
      const valid =
        Boolean(user) &&
        actualHash.length === expectedHash.length &&
        timingSafeEqual(actualHash, expectedHash);

      if (!valid || !user) {
        const locked = await recordFailedAttempt(identifierHash);
        if (locked) {
          await recordSecurityEvent("auth_throttled");
          res.setHeader("Retry-After", String(LOCKOUT_SECONDS));
          return res.status(429).json({ error: "Please wait before trying again." });
        }
        return res.status(401).json({ error: "Username or passphrase not recognized." });
      }

      await clearFailedAttempts(identifierHash);
      const expiresAt = await createSession(req, res, user);
      await recordSecurityEvent("login_succeeded", user.id);
      return res.json({ user: serializeUser(user, expiresAt) });
    } catch {
      return reportAuthFailure(res, "login");
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    setNoStore(res);
    try {
      const user = await currentSession(req, res);
      if (!user) return res.status(401).json({ error: "Not signed in." });
      return res.json({ user });
    } catch {
      return reportAuthFailure(res, "session_lookup");
    }
  });

  app.get("/api/security/sessions", async (req, res) => {
    setNoStore(res);
    try {
      const user = await currentSession(req, res);
      if (!user) return res.status(401).json({ error: "Not signed in." });
      const token = readCookie(req);
      const currentTokenHash = token ? hashSessionToken(token) : "";
      const result = await getPool().query(
        `SELECT id, created_at, expires_at, token_hash = $2 AS is_current
         FROM auth_sessions
         WHERE user_id = $1 AND expires_at > now()
         ORDER BY created_at DESC
         LIMIT 25`,
        [user.id, currentTokenHash],
      );
      return res.json({
        sessions: result.rows.map((row) => ({
          id: row.id,
          createdAt: new Date(row.created_at).toISOString(),
          expiresAt: new Date(row.expires_at).toISOString(),
          current: row.is_current === true,
        })),
      });
    } catch {
      return reportAuthFailure(res, "session_list");
    }
  });

  app.delete("/api/security/sessions/:sessionId", async (req, res) => {
    setNoStore(res);
    const sessionId = req.params.sessionId;
    if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
      return res.status(404).json({ error: "Session not found." });
    }
    try {
      const user = await currentSession(req, res);
      if (!user) return res.status(401).json({ error: "Not signed in." });
      const token = readCookie(req);
      const currentTokenHash = token ? hashSessionToken(token) : "";
      const result = await getPool().query(
        `DELETE FROM auth_sessions
         WHERE id = $1 AND user_id = $2
         RETURNING user_id, token_hash`,
        [sessionId, user.id],
      );
      if (!result.rows[0]) return res.status(404).json({ error: "Session not found." });
      await recordSecurityEvent("session_revoked", user.id);
      if (result.rows[0].token_hash === currentTokenHash) clearSessionCookie(req, res);
      return res.status(204).end();
    } catch {
      return reportAuthFailure(res, "session_revoke");
    }
  });

  app.get("/api/security/events", async (req, res) => {
    setNoStore(res);
    try {
      const user = await currentSession(req, res);
      if (!user) return res.status(401).json({ error: "Not signed in." });
      const result = await getPool().query(
        `SELECT event_type, created_at
         FROM security_events
         WHERE user_id = $1 AND expires_at > now()
         ORDER BY created_at DESC
         LIMIT 25`,
        [user.id],
      );
      return res.json({
        events: result.rows.map((row) => ({
          eventType: row.event_type,
          createdAt: new Date(row.created_at).toISOString(),
        })),
      });
    } catch {
      return reportAuthFailure(res, "security_events");
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    setNoStore(res);
    try {
      const token = readCookie(req);
      if (token) {
        const result = await getPool().query(
          "DELETE FROM auth_sessions WHERE token_hash = $1 RETURNING user_id",
          [hashSessionToken(token)],
        );
        if (result.rows[0]) {
          await recordSecurityEvent("session_revoked", result.rows[0].user_id);
        }
      }
      clearSessionCookie(req, res);
      return res.status(204).end();
    } catch {
      clearSessionCookie(req, res);
      return reportAuthFailure(res, "logout");
    }
  });
}
