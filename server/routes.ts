import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { registerAuthRoutes } from "./auth-routes";

// ─── Routes ──────────────────────────────────────────────────────────────────
export async function registerRoutes(app: Express): Promise<Server> {
  registerAuthRoutes(app);
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));
  const httpServer = createServer(app);
  return httpServer;
}
