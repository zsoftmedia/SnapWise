// src/index.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import projectsRouter from "./routes/projects/newProject";
import spotsRouter from "./routes/projects/spots/spots";
import tasksRouter from "./routes/tasks/tasks";

// ✅ ADD THIS:
import authRoutes from "./routes/auth/auth"; // or "./routes/auth/authRoutes" if that's your path

import { env } from "./utils/env";

const app = express();

// If APP_ORIGIN is a comma list, keep as array. CORS accepts string | array | function.
const corsOrigins = env.APP_ORIGIN.split(",").map(s => s.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// health first is fine
app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ mount auth before /api if you like, either way works
app.use("/auth", authRoutes);

app.use("/api", projectsRouter);
app.use("/api", spotsRouter);
app.use("/api", tasksRouter);

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Internal error" });
});

// 404
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));

app.listen(env.PORT, () => {
  console.log(`API on http://localhost:${env.PORT} (origin: ${env.APP_ORIGIN})`);
});
