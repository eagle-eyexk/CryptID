import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// ─── In-memory rate limiter (by IP) ─────────────────────────────────────────
const ipAttempts = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();

function getIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
}

function serverRateCheck(ip: string): { allowed: boolean; remainingSecs: number } {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry) return { allowed: true, remainingSecs: 0 };
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remainingSecs: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  if (now > entry.resetAt) {
    ipAttempts.delete(ip);
    return { allowed: true, remainingSecs: 0 };
  }
  return { allowed: true, remainingSecs: 0 };
}

function serverRecordAttempt(ip: string): void {
  const now = Date.now();
  const entry = ipAttempts.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  entry.count++;
  if (entry.count >= 30) {
    entry.blockedUntil = now + 60_000;
  }
  ipAttempts.set(ip, entry);
}

// ─── Input sanitization ──────────────────────────────────────────────────────
function sanitize(s: unknown, maxLen = 2000): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, maxLen);
}

// ─── Routes ──────────────────────────────────────────────────────────────────
export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/chat — GPT AI assistant via Replit AI Integrations
  app.post("/api/chat", async (req: Request, res: Response) => {
    const ip = getIp(req);
    const { allowed, remainingSecs } = serverRateCheck(ip);
    if (!allowed) {
      return res.status(429).json({ error: `Too many requests. Try again in ${remainingSecs}s.` });
    }

    const { messages, systemPrompt } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Sanitize and validate messages
    const sanitized = messages
      .filter((m: unknown) => {
        if (typeof m !== "object" || m === null) return false;
        const msg = m as Record<string, unknown>;
        return (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string";
      })
      .slice(-20) // last 20 messages only
      .map((m: Record<string, unknown>) => ({
        role: m.role as "user" | "assistant",
        content: sanitize(m.content as string),
      }));

    if (sanitized.length === 0) {
      return res.status(400).json({ error: "No valid messages" });
    }

    serverRecordAttempt(ip);

    const sysContent = sanitize(
      typeof systemPrompt === "string" ? systemPrompt : "",
      500
    ) || "You are a secure AI assistant embedded in CryptId, an encrypted ephemeral messaging app. Be helpful, concise, and privacy-conscious. Keep responses clear and to the point.";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "system", content: sysContent }, ...sanitized],
        max_completion_tokens: 600,
      });

      const content = completion.choices[0]?.message?.content ?? "";
      return res.json({ content });
    } catch (err: unknown) {
      console.error("[/api/chat] OpenAI error:", err);
      const message = err instanceof Error ? err.message : "AI unavailable";
      return res.status(502).json({ error: message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
